'use client';

import { useQuery } from '@tanstack/react-query';
import { Globe2 } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import type { TeamMemberPresence } from '@/types/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

function formatLocalTime(timezone: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return '—';
  }
}

function getInitials(name: string, email: string): string {
  if (name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function StatusPill({ status }: { status: TeamMemberPresence['status'] }) {
  const label =
    status === 'ACTIVE' ? 'Active' : status === 'IDLE' ? 'Idle' : 'Offline';
  const color =
    status === 'ACTIVE'
      ? 'bg-emerald-500/20 text-emerald-300'
      : status === 'IDLE'
        ? 'bg-amber-500/20 text-amber-300'
        : 'bg-slate-700/60 text-slate-300';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function TeamPresenceGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ['team', 'presence'],
    queryFn: async () => {
      const res = await apiClient.get<TeamMemberPresence[]>(
        '/api/v1/team/presence',
      );
      return res;
    },
    staleTime: 60 * 1000,
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
          >
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full bg-slate-800" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24 bg-slate-800" />
                <Skeleton className="h-3 w-32 bg-slate-800" />
              </div>
            </div>
            <Skeleton className="h-3 w-20 bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((member) => {
        const initials = getInitials(member.name, member.email);
        const localTime = formatLocalTime(member.timezone);

        return (
          <div
            key={member.userId}
            className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-slate-800 text-xs text-slate-200">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium text-slate-100">
                  {member.name || member.email}
                </p>
                <p className="text-xs text-slate-400">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <StatusPill status={member.status} />
              <div className="flex items-center gap-1 text-slate-400">
                <Globe2 className="h-3 w-3" />
                <span>{localTime}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

