'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Sparkles, Target } from 'lucide-react';

interface StudentData {
  name: string;
  class: string;
  attendanceRate: number;
  avgGrade: number;
  riskScore: number;
  riskLevel: string;
}

interface ClassPerf {
  name: string;
  attendance: number;
  grades: number;
  atRisk: number;
  students: number;
}

interface Recommendation {
  priority: string;
  action: string;
  impact: string;
}

interface StudentInsight {
  name: string;
  insight: string;
}

interface Predictions {
  attendanceTrend: string;
  academicOutlook: string;
  interventionUrgency: string;
}

interface AIInsightsData {
  overallInsight: string;
  keyFindings: string[];
  recommendations: Recommendation[];
  studentInsights: StudentInsight[];
  predictions: Predictions;
}

interface Props {
  students: StudentData[];
  classPerformance: ClassPerf[];
  summary: {
    totalStudents: number;
    atRisk: number;
    watchList: number;
    onTrack: number;
    avgAttendance: number;
  };
}

export function AIInsights({ students, classPerformance, summary }: Props) {
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/ai-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students, classPerformance, summary }),
        });
        const data = await res.json();
        if (data.success) {
          setInsights(data.insights);
        } else {
          setError(data.error || 'Failed to load AI insights');
        }
      } catch {
        setError('Failed to connect to AI service');
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [students, classPerformance, summary]);

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="relative">
              <Brain className="h-10 w-10 text-primary animate-pulse" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">AI is analyzing student data...</p>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  const urgencyColor = insights.predictions?.interventionUrgency === 'immediate'
    ? 'destructive'
    : insights.predictions?.interventionUrgency === 'moderate'
      ? 'warning'
      : 'success';

  return (
    <>
      {/* Executive Summary */}
      <Card className="col-span-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Executive Summary</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by GPT-4o
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{insights.overallInsight}</p>

          {/* Predictions */}
          {insights.predictions && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 p-3 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Attendance Trend</p>
                <p className="text-sm">{insights.predictions.attendanceTrend}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Academic Outlook</p>
                <p className="text-sm">{insights.predictions.academicOutlook}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Intervention Urgency</p>
                <Badge variant={urgencyColor} className="text-xs capitalize">
                  {insights.predictions.interventionUrgency}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Findings & Recommendations side by side */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Key Findings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(insights.keyFindings || []).map((finding, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(insights.recommendations || []).map((rec, i) => (
              <div key={i} className="rounded-lg border border-border/60 p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'warning' : 'secondary'}
                    className="text-xs capitalize"
                  >
                    {rec.priority} priority
                  </Badge>
                </div>
                <p className="text-sm font-medium">{rec.action}</p>
                <p className="text-xs text-muted-foreground">{rec.impact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Per-Student AI Insights */}
      {insights.studentInsights && insights.studentInsights.length > 0 && (
        <Card className="col-span-full">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Personalized Student Interventions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {insights.studentInsights.map((si, i) => (
                <div key={i} className="rounded-lg border border-border/60 p-3 space-y-1">
                  <p className="text-sm font-semibold">{si.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{si.insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
