import { ProductivityHeatmap } from '@/components/analytics/ProductivityHeatmap';

export default async function AnalyticsPage() {
  return (
    <section className="glass flex flex-1 flex-col rounded-xl p-4 md:p-6">
      <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-base font-semibold text-slate-50 md:text-lg">Analytics</h1>
          <p className="text-xs text-slate-400 md:text-sm">
            Productivity trends, heatmaps, and insights
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 md:gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 md:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-100">Productivity heatmap</p>
            <span className="text-xs text-slate-500">Last 7 days</span>
          </div>
          <ProductivityHeatmap />
        </div>
      </div>
    </section>
  );
}
