import { TeamPresenceGrid } from '@/components/team/TeamPresenceGrid';

export default async function TeamPage() {
  return (
    <section className="glass flex flex-1 flex-col rounded-xl p-4 md:p-6">
      <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-base font-semibold text-slate-50 md:text-lg">Team presence</h1>
          <p className="text-xs text-slate-400 md:text-sm">
            Live view of your team&apos;s status and local time
          </p>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-3 text-sm text-slate-400">
        <TeamPresenceGrid />
      </div>
    </section>
  );
}
