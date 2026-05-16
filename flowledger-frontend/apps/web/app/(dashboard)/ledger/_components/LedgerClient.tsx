'use client';

import { useEffect, useState } from 'react';
import { useTransactions } from '../../../../hooks/useTransactions';
import { useWallets } from '../../../../hooks/useWallets';
import { LedgerQuery, Transaction } from '../../../../types/transaction.types';
import { Wallet } from '../../../../types/wallet.types';
import { TypeBadge } from '../../../../components/TypeBadge';
import { AmountBadge } from '../../../../components/AmountBadge';
import { TransactionTypeKey } from '../../../../constants/transactionTypes';
import { formatDate } from '../../../../lib/dates';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

const PAGE_LIMIT = 20;

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array(6).fill(null).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-muted w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function LedgerClient() {
  const { ledger, loading, fetchLedger, exportCsv } = useTransactions();
  const { activeWallets } = useWallets();

  const [query, setQuery] = useState<LedgerQuery>({ page: 1, limit: PAGE_LIMIT, sortBy: 'date', sortOrder: 'DESC' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    void fetchLedger(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((q: LedgerQuery) => ({ ...q, search, page: 1 }));
  };

  const totalPages = ledger ? Math.ceil(ledger.total / PAGE_LIMIT) : 0;
  const currentPage = query.page ?? 1;

  const getAmountType = (type: TransactionTypeKey): 'inflow' | 'outflow' | 'neutral' => {
    if (type === 'inflow' || type === 'transfer_in') return 'inflow';
    if (type === 'outflow' || type === 'transfer_out' || type === 'transfer_fee') return 'outflow';
    return 'neutral';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            id="ledger-search"
            type="text"
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-48"
          />
          <Button type="submit" size="sm" variant="outline" id="ledger-search-btn">Search</Button>
        </form>

        <select
          id="ledger-type-filter"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          onChange={(e) => setQuery((q: LedgerQuery) => ({ ...q, type: (e.target.value as TransactionTypeKey) || undefined, page: 1 }))}
        >
          <option value="">All types</option>
          <option value="inflow">Inflow</option>
          <option value="outflow">Outflow</option>
          <option value="transfer_out">Transfer Out</option>
          <option value="transfer_in">Transfer In</option>
          <option value="transfer_fee">Transfer Fee</option>
        </select>

        <select
          id="ledger-wallet-filter"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          onChange={(e) => setQuery((q: LedgerQuery) => ({ ...q, walletId: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All wallets</option>
          {activeWallets.map((w: Wallet) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        <select
          id="ledger-sort"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as ['date' | 'amount', 'ASC' | 'DESC'];
            setQuery((q: LedgerQuery) => ({ ...q, sortBy, sortOrder, page: 1 }));
          }}
          defaultValue="date-DESC"
        >
          <option value="date-DESC">Date (Newest)</option>
          <option value="date-ASC">Date (Oldest)</option>
          <option value="amount-DESC">Amount (High→Low)</option>
          <option value="amount-ASC">Amount (Low→High)</option>
        </select>

        <Button
          variant="outline"
          size="sm"
          id="ledger-export"
          onClick={() => void exportCsv(query)}
        >
          ⬇ Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {['Date', 'Type', 'Amount', 'Wallet', 'Spend Tag', 'Note'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array(8).fill(null).map((_, i) => <SkeletonRow key={i} />)
                : ledger?.data.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                )
                : ledger?.data.map((tx: Transaction) => (
                  <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={tx.type} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <AmountBadge amount={tx.amount} type={getAmountType(tx.type)} />
                    </td>
                    <td className="px-4 py-3 text-foreground">{tx.wallet?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      {tx.spendTag ? (
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tx.spendTag.color }} />
                          {tx.spendTag.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {tx.note ?? tx.sourceLabel ?? '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {((currentPage - 1) * PAGE_LIMIT) + 1}–{Math.min(currentPage * PAGE_LIMIT, ledger?.total ?? 0)} of {ledger?.total} transactions
            </p>
            <div className="flex gap-2">
              <Button
                size="sm" variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setQuery((q: LedgerQuery) => ({ ...q, page: (q.page ?? 1) - 1 }))}
                id="ledger-prev"
              >
                ← Prev
              </Button>
              <Button
                size="sm" variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setQuery((q: LedgerQuery) => ({ ...q, page: (q.page ?? 1) + 1 }))}
                id="ledger-next"
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
