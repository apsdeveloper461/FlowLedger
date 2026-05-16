import type { Metadata } from 'next';
import { PageHeader } from '../../../components/PageHeader';
import SettingsClient from './_components/SettingsClient';

export const metadata: Metadata = { title: 'Settings — FlowLedger' };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account, wallets, and spend tags" />
      <SettingsClient />
    </div>
  );
}
