'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '../../../../lib/axios';
import { SPEND_TAG_ROUTES } from '../../../../constants/apiRoutes';
import { useWallets } from '../../../../hooks/useWallets';
import { useTransactions } from '../../../../hooks/useTransactions';
import { SpendTag } from '../../../../types/transaction.types';
import { ApiResponse } from '../../../../types/user.types';
import { Button } from '@workspace/ui/components/button';
import { todayIso } from '../../../../lib/dates';
import { cn } from '@workspace/ui/lib/utils';

const schema = z.object({
  walletId: z.string().uuid('Select a wallet'),
  spendTagId: z.string().uuid().optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be positive').max(99999999.99),
  note: z.string().max(500).optional(),
  date: z.string().min(1, 'Date is required'),
});

type FormData = z.infer<typeof schema>;

export default function OutflowForm() {
  const router = useRouter();
  const { activeWallets, loading: walletsLoading, fetch } = useWallets();
  const { createOutflow } = useTransactions();
  const [spendTags, setSpendTags] = useState<SpendTag[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: todayIso() },
  });

  useEffect(() => {
    void fetch();
    api.get<ApiResponse<SpendTag[]>>(SPEND_TAG_ROUTES.list)
      .then((res) => setSpendTags(res.data.data))
      .catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await createOutflow({
        walletId: data.walletId,
        spendTagId: data.spendTagId || undefined,
        amount: data.amount,
        note: data.note || undefined,
        date: data.date,
      });
      toast.success('Outflow recorded successfully!');
      reset({ date: todayIso() });
      router.push('/ledger');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to record outflow.';
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="outflow-form">
        {/* Wallet */}
        <div className="space-y-1.5">
          <label htmlFor="outflow-wallet" className="text-sm font-medium">Wallet</label>
          <select id="outflow-wallet" disabled={walletsLoading} className={fieldCls(!!errors.walletId)} {...register('walletId')}>
            <option value="">Select wallet…</option>
            {activeWallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} — PKR {w.balance.toLocaleString()}
              </option>
            ))}
          </select>
          {errors.walletId && <p className="text-xs text-destructive">{errors.walletId.message}</p>}
        </div>

        {/* Spend Tag */}
        <div className="space-y-1.5">
          <label htmlFor="outflow-tag" className="text-sm font-medium">
            Spend Tag <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <select id="outflow-tag" className={fieldCls(false)} {...register('spendTagId')}>
            <option value="">Uncategorized</option>
            {spendTags.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label htmlFor="outflow-amount" className="text-sm font-medium">Amount (PKR)</label>
          <input id="outflow-amount" type="number" step="0.01" min="0.01" placeholder="0.00"
            className={fieldCls(!!errors.amount)} {...register('amount')} />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label htmlFor="outflow-note" className="text-sm font-medium">
            Note <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea id="outflow-note" rows={2} placeholder="Any additional notes…"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            {...register('note')} />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label htmlFor="outflow-date" className="text-sm font-medium">Date</label>
          <input id="outflow-date" type="date" className={fieldCls(!!errors.date)} {...register('date')} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>

        <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white" size="lg"
          disabled={isSubmitting} id="outflow-submit">
          {isSubmitting ? 'Saving…' : '💸 Record Outflow'}
        </Button>
      </form>
    </div>
  );
}
