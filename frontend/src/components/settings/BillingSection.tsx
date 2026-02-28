'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type Plan = 'free' | 'pro';

export function BillingSection() {
  const [plan, setPlan] = useState<Plan>('free');
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const csv = await apiClient.get<string>('/api/v1/work-logs/export', {
        headers: { Accept: 'text/csv' },
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'work-logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // In a real app, surface a toast here.
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-100">Plan</h2>
        <p className="text-xs text-slate-400">
          Choose a plan that matches your team&apos;s needs.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <Card
            className={`border ${
              plan === 'free'
                ? 'border-cyan-500/60 bg-slate-900/70'
                : 'border-slate-800 bg-slate-900/40'
            }`}
            onClick={() => setPlan('free')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-slate-100">Free</CardTitle>
              {plan === 'free' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                  <Check className="h-3 w-3" />
                  Current
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <p>$0 / month</p>
              <ul className="list-disc space-y-1 pl-4 text-slate-400">
                <li>Single user</li>
                <li>Basic tracking</li>
                <li>7 days of history</li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className={`border ${
              plan === 'pro'
                ? 'border-cyan-500/60 bg-slate-900/70'
                : 'border-slate-800 bg-slate-900/40'
            }`}
            onClick={() => setPlan('pro')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-slate-100">Pro</CardTitle>
              {plan === 'pro' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                  <Check className="h-3 w-3" />
                  Current
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <p>$12 / user / month</p>
              <ul className="list-disc space-y-1 pl-4 text-slate-400">
                <li>Team presence &amp; analytics</li>
                <li>Unlimited history</li>
                <li>Priority support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-100">Data export</h2>
        <p className="text-xs text-slate-400">
          Download a CSV export of your work logs for backup or external analysis.
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 bg-slate-900 text-xs"
            onClick={() => void handleExport()}
            disabled={isExporting}
          >
            {isExporting ? 'Preparing CSV…' : 'Export work logs (CSV)'}
          </Button>
          {isExporting && (
            <Skeleton className="h-3 w-24 bg-slate-800" />
          )}
        </div>
      </section>
    </div>
  );
}

