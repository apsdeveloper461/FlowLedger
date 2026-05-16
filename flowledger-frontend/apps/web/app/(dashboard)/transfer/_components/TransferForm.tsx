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
  fromWalletId: z.string().uuid('Select source wallet'),
  toWalletId: z.string().uuid('Select destination wallet'),
  amount: z.coerce.number().positive().max(99999999.99),
  fee: z.coerce.number().min(0).max(99999.99).optional(),
  note: z.string().max(500).optional(),
  date: z.string().min(1),
}).refine((d) => d.fromWalletId !== d.toWalletId, {
  message: 'Source and destination must be different',
  path: ['toWalletId'],
});

type FormData = z.infer<typeof schema>;

export default function TransferForm() {
  const router = useRouter();
  const { activeWallets, loading: walletsLoading, fetch } = useWallets();
  const { createTransfer } = useTransactions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: todayIso(), fee: 0 },
  });

  useEffect(() => { void fetch(); }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await createTransfer({
        fromWalletId: data.fromWalletId,
        toWalletId: data.toWalletId,
        amount: data.amount,
        fee: data.fee ?? 0,
        note: data.note || undefined,
        date: data.date,
      });
      toast.success('Transfer completed!');
      reset({ date: todayIso(), fee: 0 });
      router.push('/ledger');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Transfer failed.';
      toast.error(msg);
    }
  };

  const fieldCls = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-all',
      'focus:border-primary focus:ring-2 focus:ring-primary/20',
      hasError ? 'border-destructive' : 'border-border',
    );

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="transfer-form">
        {/* From Wallet */}
        <div className="space-y-1.5">
          <label htmlFor="transfer-from" className="text-sm font-medium">From Wallet</label>
          <select id="transfer-from" disabled={walletsLoading} className={fieldCls(!!errors.fromWalletId)} {...register('fromWalletId')}>
            <option value="">Select source wallet…</option>
            {activeWallets.map((w: Wallet) => (
              <option key={w.id} value={w.id}>{w.name} — PKR {w.balance.toLocaleString()}</option>
            ))}
          </select>
          {errors.fromWalletId && <p className="text-xs text-destructive">{errors.fromWalletId.message}</p>}
        </div>

        {/* To Wallet */}
        <div className="space-y-1.5">
          <label htmlFor="transfer-to" className="text-sm font-medium">To Wallet</label>
          <select id="transfer-to" disabled={walletsLoading} className={fieldCls(!!errors.toWalletId)} {...register('toWalletId')}>
            <option value="">Select destination wallet…</option>
            {activeWallets.map((w: Wallet) => (
              <option key={w.id} value={w.id}>{w.name} — PKR {w.balance.toLocaleString()}</option>
            ))}
          </select>
          {errors.toWalletId && <p className="text-xs text-destructive">{errors.toWalletId.message}</p>}
        </div>

        {/* Amount + Fee */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="transfer-amount" className="text-sm font-medium">Amount (PKR)</label>
            <input id="transfer-amount" type="number" step="0.01" min="0.01" placeholder="0.00"
              className={fieldCls(!!errors.amount)} {...register('amount')} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="transfer-fee" className="text-sm font-medium">
              Fee <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input id="transfer-fee" type="number" step="0.01" min="0" placeholder="0.00"
              className={fieldCls(false)} {...register('fee')} />
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label htmlFor="transfer-note" className="text-sm font-medium">
            Note <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea id="transfer-note" rows={2} placeholder="Transfer reason…"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            {...register('note')} />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label htmlFor="transfer-date" className="text-sm font-medium">Date</label>
          <input id="transfer-date" type="date" className={fieldCls(!!errors.date)} {...register('date')} />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting} id="transfer-submit">
          {isSubmitting ? 'Processing…' : '🔄 Execute Transfer'}
        </Button>
      </form>
    </div>
  );
}
