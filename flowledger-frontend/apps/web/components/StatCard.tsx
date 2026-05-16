import { cn } from '@workspace/ui/lib/utils';
import { formatPKR } from '../lib/formatCurrency';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  trend?: { value: number; label: string };
  colorClass?: string;
  loading?: boolean;
  id?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  colorClass = 'text-foreground',
  loading = false,
  id,
}: StatCardProps) {
  return (
    <div
      className="bg-card border border-border rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow duration-200"
      id={id}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>

      {loading ? (
        <div className="h-8 w-3/4 rounded-lg bg-muted animate-pulse" />
      ) : (
        <p className={cn('text-2xl font-bold tracking-tight font-heading', colorClass)}>
          {formatPKR(value)}
        </p>
      )}

      {trend && !loading && (
        <div className="flex items-center gap-1.5">
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
      )}
    </div>
  );
}
