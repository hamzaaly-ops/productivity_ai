'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { apiClient } from '@/lib/api-client';
import type { ProductivityHeatmapPoint } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';

interface HeatmapRow {
  day: string;
  [hour: string]: number | string;
}

function transformToRows(points: ProductivityHeatmapPoint[]): HeatmapRow[] {
  const byDay: Record<string, HeatmapRow> = {};
  for (const p of points) {
    if (!byDay[p.day]) {
      byDay[p.day] = { day: p.day };
    }
    byDay[p.day][String(p.hour)] = p.intensity;
  }
  return Object.values(byDay);
}

export function ProductivityHeatmap() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'heatmap'],
    queryFn: async () => {
      const res = await apiClient.get<ProductivityHeatmapPoint[]>('/api/v1/analytics/heatmap');
      return res;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-32 bg-slate-800" />
        <Skeleton className="h-40 w-full bg-slate-800" />
      </div>
    );
  }

  const rows = transformToRows(data);
  const hours = Array.from({ length: 24 }, (_, i) => String(i));

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400">Higher intensity indicates more focused work.</p>
      <div className="h-48 w-full md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 8, right: 8, bottom: 8, left: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1f2933" />
            <XAxis
              type="number"
              domain={[0, 1]}
              hide
            />
            <YAxis
              type="category"
              dataKey="day"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              width={32}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
              contentStyle={{
                backgroundColor: '#020617',
                borderColor: '#1f2937',
                borderRadius: 8,
              }}
            />
            {hours.map((hour) => (
              <Bar
                key={hour}
                dataKey={hour}
                stackId="heat"
                radius={[2, 2, 2, 2]}
                fill="#22c55e"
                fillOpacity={0.2}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

