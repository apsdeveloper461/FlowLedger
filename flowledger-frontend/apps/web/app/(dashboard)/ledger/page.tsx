import type { Metadata } from 'next';
import { PageHeader } from '../../../components/PageHeader';
import LedgerClient from './_components/LedgerClient';

export const metadata: Metadata = { title: 'Flow Ledger — FlowLedger' };

export default function LedgerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Flow Ledger"
        description="Your complete transaction history"
      />
      <LedgerClient />
    </div>
  );
}
