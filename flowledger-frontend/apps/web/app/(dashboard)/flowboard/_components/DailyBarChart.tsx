'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { DailyFlowPoint } from '../../../../types/analytics.types';
import { formatPKRCompact } from '../../../../lib/formatCurrency';

interface Props { data: DailyFlowPoint[]; loading: boolean }

const ChartSkeleton = () => (
  <div className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />
);

export function DailyBarChart({ data, loading }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-base">Daily Inflow vs Outflow</h2>
        <p className="text-xs text-muted-foreground">Last 30 days</p>
      </div>
      {loading ? <ChartSkeleton /> : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: unknown) => String(v).slice(5)}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: unknown) => formatPKRCompact(Number(v))}
              className="fill-muted-foreground"
              width={72}
            />
            <Tooltip
              formatter={(v: unknown, name: unknown) => [formatPKRCompact(Number(v)), String(name)]}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="inflow" fill="#10b981" name="Inflow" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" fill="#f43f5e" name="Outflow" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
