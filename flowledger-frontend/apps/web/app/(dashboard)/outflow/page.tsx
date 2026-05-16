import type { Metadata } from 'next';
import { PageHeader } from '../../../components/PageHeader';
import OutflowForm from './_components/OutflowForm';

export const metadata: Metadata = { title: 'Add Outflow — FlowLedger' };

export default function OutflowPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader title="Add Outflow" description="Record money going out of a wallet" />
      <OutflowForm />
    </div>
  );
}
