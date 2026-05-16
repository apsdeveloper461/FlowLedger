import { cn } from '@workspace/ui/lib/utils';
import { TRANSACTION_TYPES, TransactionTypeKey } from '../constants/transactionTypes';

interface TypeBadgeProps {
  type: TransactionTypeKey;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const meta = TRANSACTION_TYPES[type];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        meta.bgColor,
        meta.color,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
