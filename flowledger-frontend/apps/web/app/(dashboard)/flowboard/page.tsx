'use client';

import { useEffect } from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '../../../components/PageHeader';
import { StatCard } from '../../../components/StatCard';
import { useDashboardStats, useAnalytics } from './_hooks/useAnalytics';
import { DailyBarChart } from './_components/DailyBarChart';
import { SpendTagDonut } from './_components/SpendTagDonut';
import { WalletBarChart } from './_components/WalletBarChart';
import { MonthlyLineChart } from './_components/MonthlyLineChart';
import { TopSpendTags } from './_components/TopSpendTags';
import { TransferFeeChart } from './_components/TransferFeeChart';

export default function FlowBoardPage() {
  const { stats, loading: statsLoading, fetch: fetchStats } = useDashboardStats();
  const {
    dailyFlow, spendTagBreakdown, walletBalances,
    monthlyNetFlow, topSpendTags, transferFees,
    loading: analyticsLoading, fetch: fetchAnalytics,
  } = useAnalytics();

  useEffect(() => {
    void fetchStats();
    void fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="FlowBoard"
        description="Your financial overview at a glance"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          id="stat-total-balance"
          label="Total Balance"
          value={stats?.totalBalance ?? 0}
          icon="🏦"
          loading={statsLoading}
        />
        <StatCard
          id="stat-total-inflow"
          label="Total Inflow"
          value={stats?.totalInflow ?? 0}
          icon="💰"
          colorClass="text-emerald-600 dark:text-emerald-400"
          loading={statsLoading}
        />
        <StatCard
          id="stat-total-outflow"
          label="Total Outflow"
          value={stats?.totalOutflow ?? 0}
          icon="💸"
          colorClass="text-rose-600 dark:text-rose-400"
          loading={statsLoading}
        />
        <StatCard
          id="stat-transfer-fees"
          label="Transfer Fees"
          value={stats?.totalFees ?? 0}
          icon="💳"
          colorClass="text-yellow-600 dark:text-yellow-400"
          loading={statsLoading}
        />
      </div>

      {/* Row 1: Daily flow + Donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyBarChart data={dailyFlow} loading={analyticsLoading} />
        </div>
        <div>
          <SpendTagDonut data={spendTagBreakdown} loading={analyticsLoading} />
        </div>
      </div>

      {/* Row 2: Monthly line + Wallet bars */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyLineChart data={monthlyNetFlow} loading={analyticsLoading} />
        <WalletBarChart data={walletBalances} loading={analyticsLoading} />
      </div>

      {/* Row 3: Top spend tags + Transfer fee */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopSpendTags data={topSpendTags} loading={analyticsLoading} />
        <TransferFeeChart data={transferFees} loading={analyticsLoading} />
      </div>
    </div>
  );
}
