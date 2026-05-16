'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TransferFeePoint } from '../../../../types/analytics.types';
import { formatPKRCompact } from '../../../../lib/formatCurrency';
import { formatMonth } from '../../../../lib/dates';

interface Props { data: TransferFeePoint[]; loading: boolean }

const ChartSkeleton = () => (
  <div className="h-48 w-full rounded-xl bg-muted/40 animate-pulse" />
);

export function TransferFeeChart({ data, loading }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-base">Transfer Fee Overview</h2>
        <p className="text-xs text-muted-foreground">Monthly fees paid on transfers</p>
      </div>
      {loading ? (
        <ChartSkeleton />
      ) : data.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
          No transfer fees yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
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
              width={64}
            />
            <Tooltip
              formatter={(v: unknown) => [formatPKRCompact(Number(v)), 'Fees']}
              labelFormatter={(label: unknown) => formatMonth(String(label))}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="totalFees" fill="#f59e0b" name="Fees" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
