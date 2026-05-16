'use client';

import { TopSpendTagItem } from '../../../../types/analytics.types';
import { formatPKR } from '../../../../lib/formatCurrency';
import { cn } from '@workspace/ui/lib/utils';

interface Props { data: TopSpendTagItem[]; loading: boolean }

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="h-3 w-3 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-2 w-full rounded-full bg-muted" />
      </div>
      <div className="h-3 w-16 rounded bg-muted" />
    </div>
  );
}

export function TopSpendTags({ data, loading }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
      <div>
        <h2 className="font-semibold text-base">Top 5 Spend Tags</h2>
        <p className="text-xs text-muted-foreground">Highest outflow categories</p>
      </div>

      <div className="space-y-4">
        {loading
          ? Array(5).fill(null).map((_, i) => <SkeletonRow key={i} />)
          : data.length === 0
          ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No spend tag data yet
            </p>
          )
          : data.map((tag, i) => (
            <div key={tag.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="font-medium truncate max-w-[140px]">{tag.name}</span>
                  <span className="text-xs text-muted-foreground">#{i + 1}</span>
                </div>
                <span className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                  {formatPKR(tag.total)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${tag.percentage}%`, backgroundColor: tag.color }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
