import type { Metadata } from 'next';
import { PageHeader } from '../../../components/PageHeader';
import TransferForm from './_components/TransferForm';

export const metadata: Metadata = { title: 'Fund Transfer — FlowLedger' };

export default function TransferPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader title="Fund Transfer" description="Move money between your wallets" />
      <TransferForm />
    </div>
  );
}
