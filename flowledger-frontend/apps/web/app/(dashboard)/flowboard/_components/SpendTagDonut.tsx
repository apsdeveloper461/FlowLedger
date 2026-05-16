'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SpendTagBreakdownItem } from '../../../../types/analytics.types';
import { formatPKR } from '../../../../lib/formatCurrency';

interface Props { data: SpendTagBreakdownItem[]; loading: boolean }

const ChartSkeleton = () => (
  <div className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />
);

export function SpendTagDonut({ data, loading }: Props) {
  const isEmpty = !loading && data.length === 0;
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4 h-full">
      <div>
        <h2 className="font-semibold text-base">Spend Tag Breakdown</h2>
        <p className="text-xs text-muted-foreground">Outflow by category</p>
      </div>
      {loading ? (
        <ChartSkeleton />
      ) : isEmpty ? (
        <div className="flex h-52 items-center justify-center text-muted-foreground text-sm">
          No outflow data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.id} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: unknown) => formatPKR(Number(v))}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                fontSize: '12px',
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
