import type { LucideIcon } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { formatPKR } from '../lib/formatCurrency';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  colorClass?: string;
  loading?: boolean;
  id?: string;
  format?: 'currency' | 'number' | 'raw';
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  colorClass = 'text-foreground',
  loading = false,
  id,
  format = 'currency',
}: StatCardProps) {
  const displayValue =
    typeof value === 'string'
      ? value
      : format === 'currency'
        ? formatPKR(value)
        : format === 'number'
          ? value.toLocaleString()
          : String(value);

  return (
    <Card id={id} className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted/60">
          <Icon className={cn('size-5', colorClass)} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <p className={cn('text-2xl font-bold tracking-tight font-heading', colorClass)}>
            {displayValue}
          </p>
        )}
        {trend && !loading && (
          <TrendRow trend={trend} />
        )}
      </CardContent>
    </Card>
  );
}

function TrendRow({ trend }: { trend: { value: number; label: string } }) {
  return (
    <div className="mt-2 flex items-center gap-1.5">
      <span
        className={cn(
          'text-xs font-medium px-1.5 py-0.5 rounded-md',
          trend.value >= 0
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        )}
      >
        {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
      </span>
      <span className="text-xs text-muted-foreground">{trend.label}</span>
    </div>
  );
}
