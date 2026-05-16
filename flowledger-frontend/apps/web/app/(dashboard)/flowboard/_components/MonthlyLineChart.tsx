'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { MonthlyNetFlowPoint } from '../../../../types/analytics.types';
import { formatPKRCompact } from '../../../../lib/formatCurrency';
import { formatMonth } from '../../../../lib/dates';

interface Props { data: MonthlyNetFlowPoint[]; loading: boolean }

const ChartSkeleton = () => (
  <div className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />
);

export function MonthlyLineChart({ data, loading }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-base">Monthly Net Flow Trend</h2>
        <p className="text-xs text-muted-foreground">Last 6 months (Inflow − Outflow)</p>
      </div>
      {loading ? (
        <ChartSkeleton />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: unknown) => formatMonth(String(v))}
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
              labelFormatter={(label: unknown) => formatMonth(String(label))}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="inflow"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Inflow"
            />
            <Line
              type="monotone"
              dataKey="outflow"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Outflow"
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{ r: 4 }}
              name="Net Flow"
              strokeDasharray="6 3"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
