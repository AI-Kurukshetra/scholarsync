'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload, Users, ClipboardCheck, BookOpen, CreditCard,
  CheckCircle2, AlertTriangle, Loader2, FileSpreadsheet,
} from 'lucide-react';

const importOptions = [
  {
    key: 'students',
    label: 'Students',
    description: 'Import student records (first_name, last_name, email, date_of_birth, gender, class_id)',
    icon: Users,
    gradient: 'from-violet-500 to-indigo-500',
    table: 'students',
    requiredColumns: ['first_name', 'last_name', 'email', 'date_of_birth', 'gender', 'class_id'],
    defaults: { status: 'active', enrollment_date: new Date().toISOString().split('T')[0] },
  },
  {
    key: 'attendance',
    label: 'Attendance',
    description: 'Import attendance records (student_id, class_id, date, status, marked_by)',
    icon: ClipboardCheck,
    gradient: 'from-cyan-500 to-teal-500',
    table: 'attendance',
    requiredColumns: ['student_id', 'class_id', 'date', 'status', 'marked_by'],
    defaults: {},
  },
  {
    key: 'library_books',
    label: 'Library Books',
    description: 'Import book catalog (title, author, isbn, category, total_copies)',
    icon: BookOpen,
    gradient: 'from-pink-500 to-rose-500',
    table: 'library_books',
    requiredColumns: ['title', 'author'],
    defaults: { total_copies: 1, available_copies: 1, status: 'available' },
  },
  {
    key: 'inventory',
    label: 'Inventory Items',
    description: 'Import inventory (name, category, quantity, unit, location, condition)',
    icon: CreditCard,
    gradient: 'from-amber-500 to-orange-500',
    table: 'inventory_items',
    requiredColumns: ['name', 'quantity', 'unit'],
    defaults: { condition: 'good' },
  },
];

interface ImportResult {
  key: string;
  success: boolean;
  count: number;
  errors: string[];
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

export default function ImportPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<ImportResult[]>([]);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleImport = async (option: typeof importOptions[0], file: File) => {
    setLoading(option.key);
    const errors: string[] = [];

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        errors.push('No data rows found in CSV');
        setResults(prev => [...prev.filter(r => r.key !== option.key), { key: option.key, success: false, count: 0, errors }]);
        setLoading(null);
        return;
      }

      // Validate required columns
      const missingCols = option.requiredColumns.filter(c => !(c in rows[0]));
      if (missingCols.length > 0) {
        errors.push(`Missing required columns: ${missingCols.join(', ')}`);
        setResults(prev => [...prev.filter(r => r.key !== option.key), { key: option.key, success: false, count: 0, errors }]);
        setLoading(null);
        return;
      }

      // Apply defaults and clean data
      const cleanedRows = rows.map(row => {
        const cleaned: Record<string, unknown> = { ...option.defaults };
        for (const [key, value] of Object.entries(row)) {
          if (value !== '') cleaned[key] = value;
        }
        return cleaned;
      });

      const { error } = await supabase.from(option.table).insert(cleanedRows);

      if (error) {
        errors.push(error.message);
        setResults(prev => [...prev.filter(r => r.key !== option.key), { key: option.key, success: false, count: 0, errors }]);
      } else {
        setResults(prev => [...prev.filter(r => r.key !== option.key), { key: option.key, success: true, count: cleanedRows.length, errors: [] }]);
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'Unknown error');
      setResults(prev => [...prev.filter(r => r.key !== option.key), { key: option.key, success: false, count: 0, errors }]);
    }

    setLoading(null);
  };

  return (
    <>
      <PageHeader title="Import Data" description="Upload CSV files to bulk import data" />

      <div className="grid gap-4 sm:grid-cols-2">
        {importOptions.map((option) => {
          const result = results.find(r => r.key === option.key);
          return (
            <Card key={option.key}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                    <option.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>

                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      ref={el => { fileRefs.current[option.key] = el; }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImport(option, file);
                      }}
                    />

                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileRefs.current[option.key]?.click()}
                        disabled={loading === option.key}
                      >
                        {loading === option.key ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Upload CSV
                      </Button>

                      {result && (
                        <Badge variant={result.success ? 'success' : 'destructive'} className="gap-1">
                          {result.success ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              {result.count} imported
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3" />
                              Failed
                            </>
                          )}
                        </Badge>
                      )}
                    </div>

                    {result && !result.success && result.errors.length > 0 && (
                      <p className="text-xs text-destructive mt-2">{result.errors[0]}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CSV Format Guide */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">CSV Format Guide</p>
          </div>
          <div className="text-xs text-muted-foreground space-y-2">
            <p>Your CSV file should have a header row with column names matching the required fields.</p>
            <p><strong>Example (Students):</strong></p>
            <code className="block bg-secondary/50 rounded-lg p-3 text-[11px] font-mono">
              first_name,last_name,email,date_of_birth,gender,class_id<br />
              Rahul,Kumar,rahul@example.com,2012-05-15,male,c1000000-0000-0000-0000-000000000001<br />
              Priya,Singh,priya@example.com,2012-08-22,female,c1000000-0000-0000-0000-000000000002
            </code>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
