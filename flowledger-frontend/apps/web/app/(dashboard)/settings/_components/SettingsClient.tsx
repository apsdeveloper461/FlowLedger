'use client';

import { useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import WalletsTab from './WalletsTab';
import SpendTagsTab from './SpendTagsTab';

type Tab = 'wallets' | 'spend-tags';

const TABS: { id: Tab; label: string }[] = [
  { id: 'wallets', label: '🏦 Wallets' },
  { id: 'spend-tags', label: '🏷 Spend Tags' },
];

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState<Tab>('wallets');

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex border-b border-border gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`settings-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'wallets' && <WalletsTab />}
      {activeTab === 'spend-tags' && <SpendTagsTab />}
    </div>
  );
}
