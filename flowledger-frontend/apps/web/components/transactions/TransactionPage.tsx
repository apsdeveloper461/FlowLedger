'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { Plus, Download, Search } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useTransactions } from '../../hooks/useTransactions';
import { useWallets } from '../../hooks/useWallets';
import { useDashboardStats } from '../../app/(dashboard)/flowboard/_hooks/useAnalytics';
import { LedgerQuery, Transaction } from '../../types/transaction.types';
import { TransactionTypeKey } from '../../constants/transactionTypes';
import { Wallet } from '../../types/wallet.types';
import { TypeBadge } from '../TypeBadge';
import { AmountBadge } from '../AmountBadge';
import { StatCard } from '../StatCard';
import { AnimatedPage, AnimatedStagger, AnimatedItem } from '../animated-page';
import { formatDate } from '../../lib/dates';
import type { LucideIcon } from 'lucide-react';

const PAGE_LIMIT = 20;

type FormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export interface TransactionPageConfig {
  title: string;
  description: string;
  defaultType?: TransactionTypeKey;
  typeFilterOptions?: { value: string; label: string }[];
  addButtonLabel: string;
  FormDialog: ComponentType<FormDialogProps>;
  stats: {
    id: string;
    label: string;
    getValue: (ctx: StatsContext) => number | string;
    icon: LucideIcon;
    colorClass?: string;
    format?: 'currency' | 'number' | 'raw';
  }[];
}

interface StatsContext {
  dashboardTotal?: number;
  ledgerTotal: number;
  pageSum: number;
}

function getAmountType(type: TransactionTypeKey): 'inflow' | 'outflow' | 'neutral' {
  if (type === 'inflow' || type === 'transfer_in') return 'inflow';
  if (type === 'outflow' || type === 'transfer_out' || type === 'transfer_fee') return 'outflow';
  return 'neutral';
}

function firstDayOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function TransactionPage({
  title,
  description,
  defaultType,
  typeFilterOptions,
  addButtonLabel,
  FormDialog,
  stats,
}: TransactionPageConfig) {
  const { ledger, loading, fetchLedger, exportCsv } = useTransactions();
  const { activeWallets, fetch: fetchWallets } = useWallets();
  const { loading: statsLoading, fetch: fetchStats } = useDashboardStats({
    dateFrom: firstDayOfMonth(),
  });
  const { stats: allTimeStats, fetch: fetchAllStats } = useDashboardStats();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>(defaultType ?? '');
  const [query, setQuery] = useState<LedgerQuery>({
    page: 1,
    limit: PAGE_LIMIT,
    sortBy: 'date',
    sortOrder: 'DESC',
    type: defaultType,
  });

  const refresh = () => {
    void fetchLedger(query);
    void fetchStats();
    void fetchAllStats();
  };

  useEffect(() => {
    void fetchWallets();
    void fetchAllStats();
    void fetchStats();
  }, []);

  useEffect(() => {
    void fetchLedger(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((q) => ({ ...q, search, page: 1 }));
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    refresh();
  };

  const pageSum =
    ledger?.data.reduce((sum, tx) => sum + Number(tx.amount), 0) ?? 0;

  const statsCtx: StatsContext = {
    dashboardTotal: allTimeStats
      ? defaultType === 'inflow'
        ? allTimeStats.totalInflow
        : defaultType === 'outflow'
          ? allTimeStats.totalOutflow
          : allTimeStats.totalFees
      : 0,
    ledgerTotal: ledger?.total ?? 0,
    pageSum,
  };

  const totalPages = ledger ? Math.ceil(ledger.total / PAGE_LIMIT) : 0;
  const currentPage = query.page ?? 1;

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="shrink-0 gap-2">
          <Plus className="size-4" />
          {addButtonLabel}
        </Button>
      </div>

      <AnimatedStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <AnimatedItem key={s.id}>
            <StatCard
              id={s.id}
              label={s.label}
              value={s.getValue(statsCtx)}
              icon={s.icon}
              colorClass={s.colorClass}
              format={s.format}
              loading={statsLoading && s.format === 'currency'}
            />
          </AnimatedItem>
        ))}
      </AnimatedStagger>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Refine the transaction list below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
            <form onSubmit={handleSearch} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="tx-search"
                  placeholder="Search notes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ps-9"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                Search
              </Button>
            </form>

            {typeFilterOptions && (
              <Select
                value={typeFilter || 'all'}
                onValueChange={(v) => {
                  const type = v === 'all' ? undefined : (v as TransactionTypeKey);
                  setTypeFilter(v === 'all' ? '' : v);
                  setQuery((q) => ({ ...q, type, page: 1 }));
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {typeFilterOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              onValueChange={(v) =>
                setQuery((q) => ({ ...q, walletId: v === 'all' ? undefined : v, page: 1 }))
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Wallet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All wallets</SelectItem>
                {activeWallets.map((w: Wallet) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              defaultValue="date-DESC"
              onValueChange={(v) => {
                const [sortBy, sortOrder] = v.split('-') as ['date' | 'amount', 'ASC' | 'DESC'];
                setQuery((q) => ({ ...q, sortBy, sortOrder, page: 1 }));
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-DESC">Date (Newest)</SelectItem>
                <SelectItem value="date-ASC">Date (Oldest)</SelectItem>
                <SelectItem value="amount-DESC">Amount (High→Low)</SelectItem>
                <SelectItem value="amount-ASC">Amount (Low→High)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="gap-2" onClick={() => void exportCsv(query)}>
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden sm:table-cell">Wallet</TableHead>
                <TableHead className="hidden md:table-cell">Tag</TableHead>
                <TableHead className="hidden lg:table-cell">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : ledger?.data.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )
                  : ledger?.data.map((tx: Transaction) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell>
                        <TypeBadge type={tx.type} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <AmountBadge amount={tx.amount} type={getAmountType(tx.type)} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{tx.wallet?.name ?? '—'}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {tx.spendTag ? (
                          <span className="flex items-center gap-1.5">
                            <span
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: tx.spendTag.color }}
                            />
                            {tx.spendTag.name}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="hidden max-w-[200px] truncate text-muted-foreground lg:table-cell">
                        {tx.note ?? tx.sourceLabel ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * PAGE_LIMIT + 1}–
              {Math.min(currentPage * PAGE_LIMIT, ledger?.total ?? 0)} of {ledger?.total}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={handleSuccess} />
    </AnimatedPage>
  );
}
