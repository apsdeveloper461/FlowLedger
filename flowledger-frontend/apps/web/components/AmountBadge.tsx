import { cn } from '@workspace/ui/lib/utils';
import { formatPKR } from '../lib/formatCurrency';

interface AmountBadgeProps {
  amount: number;
  type: 'inflow' | 'outflow' | 'neutral';
  className?: string;
}

export function AmountBadge({ amount, type, className }: AmountBadgeProps) {
  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        type === 'inflow' && 'text-emerald-600 dark:text-emerald-400',
        type === 'outflow' && 'text-rose-600 dark:text-rose-400',
        type === 'neutral' && 'text-foreground',
        className,
      )}
    >
      {type === 'inflow' && '+ '}
      {type === 'outflow' && '− '}
      {formatPKR(amount)}
    </span>
  );
}
