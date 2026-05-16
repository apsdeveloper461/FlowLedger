'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ResponsiveContainer,
} from 'recharts';
import { WalletBalanceItem } from '../../../../types/analytics.types';
import { formatPKRCompact } from '../../../../lib/formatCurrency';

interface Props { data: WalletBalanceItem[]; loading: boolean }

const ChartSkeleton = () => (
  <div className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />
);

export function WalletBarChart({ data, loading }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-base">Wallet Balance Distribution</h2>
        <p className="text-xs text-muted-foreground">Active wallets only</p>
      </div>
      {loading ? (
        <ChartSkeleton />
      ) : data.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-muted-foreground text-sm">
          No wallets yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: unknown) => formatPKRCompact(Number(v))}
              className="fill-muted-foreground"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={90}
              className="fill-muted-foreground"
            />
            <Tooltip
              formatter={(v: unknown) => [formatPKRCompact(Number(v)), 'Balance']}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="balance" radius={[0, 6, 6, 0]}>
              {data.map((entry) => (
                <Cell key={entry.id} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
