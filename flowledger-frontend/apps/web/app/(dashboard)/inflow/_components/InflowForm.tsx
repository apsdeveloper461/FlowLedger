'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useWallets } from '../../../../hooks/useWallets';
import { useTransactions } from '../../../../hooks/useTransactions';
import { Wallet } from '../../../../types/wallet.types';
import { Button } from '@workspace/ui/components/button';
import { todayIso } from '../../../../lib/dates';
import { cn } from '@workspace/ui/lib/utils';

const schema = z.object({
  walletId: z.string().uuid('Select a wallet'),
  amount: z.coerce.number().positive('Amount must be positive').max(99999999.99),
  sourceLabel: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
  date: z.string().min(1, 'Date is required'),
});

type FormData = z.infer<typeof schema>;

export default function InflowForm() {
  const router = useRouter();
  const { activeWallets, loading: walletsLoading, fetch } = useWallets();
  const { createInflow } = useTransactions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: todayIso() },
  });

  useEffect(() => { void fetch(); }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await createInflow({
        walletId: data.walletId,
        amount: data.amount,
        sourceLabel: data.sourceLabel || undefined,
        note: data.note || undefined,
        date: data.date,
      });
      toast.success('Inflow recorded successfully!');
      reset({ date: todayIso() });
      router.push('/ledger');
    } catch {
      toast.error('Failed to record inflow. Please try again.');
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="inflow-form">
        {/* Wallet */}
        <div className="space-y-1.5">
          <label htmlFor="inflow-wallet" className="text-sm font-medium">Wallet</label>
          <select
            id="inflow-wallet"
            disabled={walletsLoading}
            className={cn(
              'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-all',
              'focus:border-primary focus:ring-2 focus:ring-primary/20',
              errors.walletId ? 'border-destructive' : 'border-border',
            )}
            {...register('walletId')}
          >
            <option value="">Select wallet…</option>
            {activeWallets.map((w: Wallet) => (
              <option key={w.id} value={w.id}>
                {w.name} — PKR {w.balance.toLocaleString()}
              </option>
            ))}
          </select>
          {errors.walletId && <p className="text-xs text-destructive">{errors.walletId.message}</p>}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label htmlFor="inflow-amount" className="text-sm font-medium">Amount (PKR)</label>
          <input
            id="inflow-amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className={cn(
              'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-all',
              'focus:border-primary focus:ring-2 focus:ring-primary/20',
              errors.amount ? 'border-destructive' : 'border-border',
            )}
            {...register('amount')}
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>

        {/* Source Label */}
        <div className="space-y-1.5">
          <label htmlFor="inflow-source" className="text-sm font-medium">
            Source <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="inflow-source"
            type="text"
            placeholder="e.g. Salary, Freelance, Gift"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            {...register('sourceLabel')}
          />
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label htmlFor="inflow-note" className="text-sm font-medium">
            Note <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            id="inflow-note"
            rows={2}
            placeholder="Any additional notes…"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            {...register('note')}
          />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label htmlFor="inflow-date" className="text-sm font-medium">Date</label>
          <input
            id="inflow-date"
            type="date"
            className={cn(
              'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-all',
              'focus:border-primary focus:ring-2 focus:ring-primary/20',
              errors.date ? 'border-destructive' : 'border-border',
            )}
            {...register('date')}
          />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          size="lg"
          disabled={isSubmitting}
          id="inflow-submit"
        >
          {isSubmitting ? 'Saving…' : '💰 Record Inflow'}
        </Button>
      </form>
    </div>
  );
}
