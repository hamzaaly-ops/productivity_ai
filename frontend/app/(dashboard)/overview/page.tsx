export default async function OverviewPage() {
  return (
    <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] lg:gap-6">
      <div className="glass-strong glow-primary flex flex-col rounded-xl p-4 md:p-6">
        <header className="mb-4 flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h1 className="text-base font-semibold text-slate-50 md:text-lg">Overview</h1>
            <p className="text-xs text-slate-400 md:text-sm">
              Your productivity dashboard and active sessions
            </p>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
          <p className="text-sm text-slate-300">
            Session tracking and metrics will appear here.
          </p>
        </div>
      </div>

      <aside className="glass flex flex-col rounded-xl p-4 md:p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-100">Today at a glance</h2>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="space-y-1 rounded-lg bg-slate-900/60 p-3">
            <p className="stat-label">Tracked</p>
            <p className="stat-value text-2xl">0h</p>
          </div>
          <div className="space-y-1 rounded-lg bg-slate-900/60 p-3">
            <p className="stat-label">Deep work</p>
            <p className="stat-value text-2xl">0h</p>
          </div>
          <div className="space-y-1 rounded-lg bg-slate-900/60 p-3">
            <p className="stat-label">Context switches</p>
            <p className="stat-value text-2xl">0</p>
          </div>
          <div className="space-y-1 rounded-lg bg-slate-900/60 p-3">
            <p className="stat-label">Breaks</p>
            <p className="stat-value text-2xl">0</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
