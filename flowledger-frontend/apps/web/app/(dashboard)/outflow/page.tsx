'use client';

import { ArrowUpRight, Hash, TrendingDown } from 'lucide-react';
import { TransactionPage } from '../../../components/transactions/TransactionPage';
import { OutflowDialog } from '../../../components/transactions/OutflowDialog';

export default function OutflowPage() {
  return (
    <TransactionPage
      title="Outflow"
      description="Track and record money leaving your wallets"
      defaultType="outflow"
      addButtonLabel="Add Outflow"
      FormDialog={OutflowDialog}
      stats={[
        {
          id: 'stat-total-outflow',
          label: 'Total Outflow',
          icon: TrendingDown,
          colorClass: 'text-rose-600 dark:text-rose-400',
          format: 'currency',
          getValue: (ctx) => ctx.dashboardTotal ?? 0,
        },
        {
          id: 'stat-outflow-count',
          label: 'Transactions',
          icon: Hash,
          format: 'number',
          getValue: (ctx) => ctx.ledgerTotal,
        },
        {
          id: 'stat-outflow-page-sum',
          label: 'Page Total',
          icon: ArrowUpRight,
          colorClass: 'text-rose-600 dark:text-rose-400',
          format: 'currency',
          getValue: (ctx) => ctx.pageSum,
        },
      ]}
    />
  );
}
