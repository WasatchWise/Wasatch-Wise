'use client';

/**
 * Quiz Results Page
 * 
 * Displays audit scores and AI-generated recommendations
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface AuditResult {
  id: string;
  score_compliance: number;
  score_safety: number;
  score_fluency: number;
  ai_analysis: {
    risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
    liability_gap: string;
    prescription: string;
    top_risks: string[];
    next_steps: string[];
  } | null;
  status: string;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get('auditId');
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auditId) {
      setError('No audit ID provided');
      setLoading(false);
      return;
    }

    const fetchAudit = async () => {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('audits')
          .select('*')
          .eq('id', auditId)
          .single();

        if (fetchError) {
          setError('Failed to load audit results');
          return;
        }

        setAudit(data);
      } catch (err) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();

    // Poll for updates if analysis is still running
    const interval = setInterval(() => {
      if (audit?.status === 'analyzing' || audit?.status === 'pending_analysis') {
        fetchAudit();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [auditId, audit?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || 'Audit not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/quiz'}>
              Start New Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scores = {
    compliance: audit.score_compliance || 0,
    safety: audit.score_safety || 0,
    fluency: audit.score_fluency || 0,
  };

  const overallScore = Math.round(
    (scores.compliance + scores.safety + scores.fluency) / 3
  );

  const riskLevel = audit.ai_analysis?.risk_level || 
    (overallScore < 50 ? 'HIGH' : overallScore < 75 ? 'MEDIUM' : 'LOW');

  const riskColor = {
    HIGH: 'text-red-600 bg-red-50 border-red-200',
    MEDIUM: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    LOW: 'text-green-600 bg-green-50 border-green-200',
  }[riskLevel];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Your AI Readiness Audit Results</CardTitle>
            <CardDescription>
              Comprehensive analysis of your district's AI governance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${riskColor}`}>
              <span className="text-sm font-semibold">Risk Level: {riskLevel}</span>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
            <CardDescription>Your district's performance across three dimensions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Compliance (Policy & Governance)</span>
                <span className="text-sm font-semibold">{scores.compliance}/100</span>
              </div>
              <Progress value={scores.compliance} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Safety (Usage & Incidents)</span>
                <span className="text-sm font-semibold">{scores.safety}/100</span>
              </div>
              <Progress value={scores.safety} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Fluency (Communication & Trust)</span>
                <span className="text-sm font-semibold">{scores.fluency}/100</span>
              </div>
              <Progress value={scores.fluency} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        {audit.ai_analysis ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Primary Concern</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-700">{audit.ai_analysis.liability_gap}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-700">{audit.ai_analysis.prescription}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 3 Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-zinc-700">
                  {audit.ai_analysis.top_risks.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-zinc-700">
                  {audit.ai_analysis.next_steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </>
        ) : audit.status === 'analyzing' || audit.status === 'pending_analysis' ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                <p className="text-zinc-600">AI analysis in progress. This page will update automatically...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-zinc-600 text-center">
                Analysis is being prepared. Please check back in a few moments.
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-zinc-700">
                Want a detailed consultation? Let's discuss your district's AI governance strategy.
              </p>
              <Button size="lg" className="w-full sm:w-auto">
                Schedule Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
