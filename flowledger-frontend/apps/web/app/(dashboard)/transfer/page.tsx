'use client';

import { ArrowLeftRight, CreditCard, Hash } from 'lucide-react';
import { TransactionPage } from '../../../components/transactions/TransactionPage';
import { TransferDialog } from '../../../components/transactions/TransferDialog';

export default function TransferPage() {
  return (
    <TransactionPage
      title="Transfer"
      description="Move money between wallets and track transfer fees"
      defaultType="transfer_out"
      addButtonLabel="New Transfer"
      FormDialog={TransferDialog}
      typeFilterOptions={[
        { value: 'transfer_out', label: 'Transfer Out' },
        { value: 'transfer_in', label: 'Transfer In' },
        { value: 'transfer_fee', label: 'Transfer Fee' },
      ]}
      stats={[
        {
          id: 'stat-transfer-fees',
          label: 'Total Fees',
          icon: CreditCard,
          colorClass: 'text-amber-600 dark:text-amber-400',
          format: 'currency',
          getValue: (ctx) => ctx.dashboardTotal ?? 0,
        },
        {
          id: 'stat-transfer-count',
          label: 'Transactions',
          icon: Hash,
          format: 'number',
          getValue: (ctx) => ctx.ledgerTotal,
        },
        {
          id: 'stat-transfer-page-sum',
          label: 'Page Total',
          icon: ArrowLeftRight,
          format: 'currency',
          getValue: (ctx) => ctx.pageSum,
        },
      ]}
    />
  );
}
