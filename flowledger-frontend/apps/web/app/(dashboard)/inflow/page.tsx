'use client';

import { ArrowDownLeft, Hash, TrendingUp } from 'lucide-react';
import { TransactionPage } from '../../../components/transactions/TransactionPage';
import { InflowDialog } from '../../../components/transactions/InflowDialog';

export default function InflowPage() {
  return (
    <TransactionPage
      title="Inflow"
      description="Track and record money coming into your wallets"
      defaultType="inflow"
      addButtonLabel="Add Inflow"
      FormDialog={InflowDialog}
      stats={[
        {
          id: 'stat-total-inflow',
          label: 'Total Inflow',
          icon: TrendingUp,
          colorClass: 'text-emerald-600 dark:text-emerald-400',
          format: 'currency',
          getValue: (ctx) => ctx.dashboardTotal ?? 0,
        },
        {
          id: 'stat-inflow-count',
          label: 'Transactions',
          icon: Hash,
          format: 'number',
          getValue: (ctx) => ctx.ledgerTotal,
        },
        {
          id: 'stat-inflow-page-sum',
          label: 'Page Total',
          icon: ArrowDownLeft,
          colorClass: 'text-emerald-600 dark:text-emerald-400',
          format: 'currency',
          getValue: (ctx) => ctx.pageSum,
        },
      ]}
    />
  );
}
