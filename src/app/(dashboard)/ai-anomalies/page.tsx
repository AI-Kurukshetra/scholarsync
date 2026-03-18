'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Loader2, AlertTriangle, TrendingDown, BookOpen, CreditCard, ClipboardCheck, Zap } from 'lucide-react';

interface AnomalyData {
  rawAnomalies: {
    attendanceDrops: number;
    lowGrades: number;
    overdueFees: number;
    overdueBooks: number;
    total: number;
  };
  analysis: {
    criticalAlerts: {
      title: string;
      description: string;
      category: string;
      urgency: string;
      recommendation: string;
    }[];
    summary: string;
    trendAnalysis: string;
    immediateActions: string[];
  };
}

const categoryConfig: Record<string, { icon: typeof AlertTriangle; color: string }> = {
  attendance: { icon: ClipboardCheck, color: 'text-orange-400 bg-orange-400/10' },
  grades: { icon: TrendingDown, color: 'text-red-400 bg-red-400/10' },
  fees: { icon: CreditCard, color: 'text-amber-400 bg-amber-400/10' },
  library: { icon: BookOpen, color: 'text-blue-400 bg-blue-400/10' },
};

const urgencyConfig: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

export default function AIAnomaliesPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnomalyData | null>(null);
  const [error, setError] = useState('');

  const runDetection = async () => {
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch('/api/ai-anomalies');
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Failed to run anomaly detection');
      } else {
        setData(result);
      }
    } catch {
      setError('Failed to run anomaly detection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-gradient">AI Anomaly Detection</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Proactively scans school data to detect unusual patterns — attendance drops, failing grades, overdue payments, and more.
          </p>
        </div>
        <Button onClick={runDetection} disabled={loading} className="h-12 px-6 rounded-xl">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
          {loading ? 'Scanning...' : 'Run Detection'}
        </Button>
      </div>

      {error && (
        <div className="card-glass rounded-2xl p-4 border border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {loading && (
        <div className="card-glass rounded-2xl p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Scanning 30 days of data across attendance, grades, fees, and library...</p>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Anomaly counts */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total Anomalies', value: data.rawAnomalies.total, color: 'text-red-400' },
              { label: 'Attendance Drops', value: data.rawAnomalies.attendanceDrops, color: 'text-orange-400' },
              { label: 'Low Grades', value: data.rawAnomalies.lowGrades, color: 'text-red-400' },
              { label: 'Overdue Fees', value: data.rawAnomalies.overdueFees, color: 'text-amber-400' },
              { label: 'Overdue Books', value: data.rawAnomalies.overdueBooks, color: 'text-blue-400' },
            ].map((stat) => (
              <div key={stat.label} className="card-glass rounded-xl p-4 text-center">
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* AI Summary */}
          <div className="card-glass rounded-2xl p-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <h3 className="font-semibold mb-2">AI Summary</h3>
            <p className="text-sm text-muted-foreground">{data.analysis.summary}</p>
          </div>

          {/* Trend Analysis */}
          {data.analysis.trendAnalysis && (
            <div className="card-glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-accent" />
                <h3 className="font-semibold">Trend Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground">{data.analysis.trendAnalysis}</p>
            </div>
          )}

          {/* Critical Alerts */}
          {data.analysis.criticalAlerts?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Alerts ({data.analysis.criticalAlerts.length})
              </h3>
              {data.analysis.criticalAlerts.map((alert, i) => {
                const catConf = categoryConfig[alert.category] || categoryConfig.attendance;
                const Icon = catConf.icon;
                const urgClass = urgencyConfig[alert.urgency] || urgencyConfig.info;

                return (
                  <div key={i} className={`card-glass rounded-2xl p-5 border ${urgClass}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${catConf.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold">{alert.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${urgClass}`}>
                            {alert.urgency}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                        <div className="text-xs bg-secondary/30 rounded-lg px-3 py-2">
                          <span className="font-medium text-foreground">Recommendation:</span>{' '}
                          <span className="text-muted-foreground">{alert.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Immediate Actions */}
          {data.analysis.immediateActions?.length > 0 && (
            <div className="card-glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Immediate Actions Required</h3>
              </div>
              <ol className="space-y-2">
                {data.analysis.immediateActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{action}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {!loading && !data && !error && (
        <div className="card-glass rounded-2xl p-12 text-center">
          <ShieldAlert className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Click &quot;Run Detection&quot; to scan for anomalies across your school data.</p>
        </div>
      )}
    </div>
  );
}
