'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { StatCard } from '../../../components/StatCard';
import { AnimatedPage, AnimatedStagger, AnimatedItem } from '../../../components/animated-page';
import { InflowDialog } from '../../../components/transactions/InflowDialog';
import { OutflowDialog } from '../../../components/transactions/OutflowDialog';
import { TransferDialog } from '../../../components/transactions/TransferDialog';
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
    dailyFlow,
    spendTagBreakdown,
    walletBalances,
    monthlyNetFlow,
    topSpendTags,
    transferFees,
    loading: analyticsLoading,
    fetch: fetchAnalytics,
  } = useAnalytics();

  const [inflowOpen, setInflowOpen] = useState(false);
  const [outflowOpen, setOutflowOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const refresh = () => {
    void fetchStats();
    void fetchAnalytics();
  };

  useEffect(() => {
    void fetchStats();
    void fetchAnalytics();
  }, []);

  return (
    <AnimatedPage className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">FlowBoard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your financial overview at a glance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setInflowOpen(true)}>
            <ArrowDownLeft className="size-4" />
            Inflow
          </Button>
          <Button size="sm" variant="outline" className="gap-2 text-rose-600" onClick={() => setOutflowOpen(true)}>
            <ArrowUpRight className="size-4" />
            Outflow
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setTransferOpen(true)}>
            <ArrowLeftRight className="size-4" />
            Transfer
          </Button>
        </div>
      </div>

      <AnimatedStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnimatedItem>
          <StatCard
            id="stat-total-balance"
            label="Total Balance"
            value={stats?.totalBalance ?? 0}
            icon={Wallet}
            loading={statsLoading}
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            id="stat-total-inflow"
            label="Total Inflow"
            value={stats?.totalInflow ?? 0}
            icon={ArrowDownLeft}
            colorClass="text-emerald-600 dark:text-emerald-400"
            loading={statsLoading}
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            id="stat-total-outflow"
            label="Total Outflow"
            value={stats?.totalOutflow ?? 0}
            icon={ArrowUpRight}
            colorClass="text-rose-600 dark:text-rose-400"
            loading={statsLoading}
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            id="stat-transfer-fees"
            label="Transfer Fees"
            value={stats?.totalFees ?? 0}
            icon={CreditCard}
            colorClass="text-amber-600 dark:text-amber-400"
            loading={statsLoading}
          />
        </AnimatedItem>
      </AnimatedStagger>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Daily Flow</CardTitle>
            <CardDescription>Inflow vs outflow over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <DailyBarChart data={dailyFlow} loading={analyticsLoading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spend Tags</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <SpendTagDonut data={spendTagBreakdown} loading={analyticsLoading} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Net Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyLineChart data={monthlyNetFlow} loading={analyticsLoading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wallet Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <WalletBarChart data={walletBalances} loading={analyticsLoading} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Spend Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <TopSpendTags data={topSpendTags} loading={analyticsLoading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transfer Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <TransferFeeChart data={transferFees} loading={analyticsLoading} />
          </CardContent>
        </Card>
      </div>

      <InflowDialog open={inflowOpen} onOpenChange={setInflowOpen} onSuccess={refresh} />
      <OutflowDialog open={outflowOpen} onOpenChange={setOutflowOpen} onSuccess={refresh} />
      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} onSuccess={refresh} />
    </AnimatedPage>
  );
}
