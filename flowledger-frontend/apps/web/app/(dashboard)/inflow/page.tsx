import type { Metadata } from 'next';
import { PageHeader } from '../../../components/PageHeader';
import InflowForm from './_components/InflowForm';

export const metadata: Metadata = { title: 'Add Inflow — FlowLedger' };

export default function InflowPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader
        title="Add Inflow"
        description="Record money coming into a wallet"
      />
      <InflowForm />
    </div>
  );
}
