'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Database, Sparkles, Table, AlertCircle } from 'lucide-react';

interface QueryResult {
  success: boolean;
  data: Record<string, unknown>[];
  explanation: string;
  query: string | null;
  rowCount: number;
  queryError?: string;
  error?: string;
}

const EXAMPLE_QUERIES = [
  'Show all students with attendance below 75%',
  'Which classes have the most absent students?',
  'List students who have overdue library books',
  'Show top 10 students by average grade',
  'How many fee payments are overdue?',
  'Which teachers handle the most subjects?',
  'Show students enrolled in the last 30 days',
  'List all hostel rooms that are full',
];

export default function AIQueryPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState('');

  const handleQuery = async (q?: string) => {
    const queryText = q || question;
    if (!queryText.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryText }),
      });

      const data = await res.json();

      if (!data.success && data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError('Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Database className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-gradient">AI Natural Language Query</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask questions about your school data in plain English. AI converts your question to a database query and returns results.
        </p>
      </div>

      {/* Search box */}
      <div className="card-glass rounded-2xl p-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ask anything... e.g., 'Show students with attendance below 75%'"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              className="pl-10 h-12 rounded-xl bg-secondary/50 border-border/40 text-sm"
            />
          </div>
          <Button
            onClick={() => handleQuery()}
            disabled={loading || !question.trim()}
            className="h-12 px-6 rounded-xl"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="ml-2">{loading ? 'Querying...' : 'Ask AI'}</span>
          </Button>
        </div>

        {/* Example queries */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((eq) => (
            <button
              key={eq}
              onClick={() => { setQuestion(eq); handleQuery(eq); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card-glass rounded-2xl p-4 border border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Explanation */}
          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">AI Explanation</h3>
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
              </div>
            </div>
          </div>

          {/* Generated SQL */}
          {result.query && (
            <div className="card-glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold">Generated SQL</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium uppercase">read-only</span>
              </div>
              <pre className="text-xs bg-black/30 rounded-xl p-4 overflow-x-auto text-emerald-400 font-mono">
                {result.query}
              </pre>
            </div>
          )}

          {/* Query Error */}
          {result.queryError && (
            <div className="card-glass rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5">
              <p className="text-sm text-amber-400">{result.queryError}</p>
            </div>
          )}

          {/* Data Table */}
          {result.data && result.data.length > 0 && (
            <div className="card-glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Table className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Results</h3>
                <span className="text-xs text-muted-foreground">({result.rowCount} rows)</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-secondary/30">
                      {Object.keys(result.data[0]).map((key) => (
                        <th key={key} className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((row, i) => (
                      <tr key={i} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-2.5 text-xs">
                            {val === null ? <span className="text-muted-foreground italic">null</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.data && result.data.length === 0 && !result.queryError && (
            <div className="card-glass rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground">No results found for this query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
