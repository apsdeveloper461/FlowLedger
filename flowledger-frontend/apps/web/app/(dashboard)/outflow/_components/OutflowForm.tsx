'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowUpRight } from 'lucide-react';
import api from '../../../../lib/axios';
import { SPEND_TAG_ROUTES } from '../../../../constants/apiRoutes';
import { useWallets } from '../../../../hooks/useWallets';
import { useTransactions } from '../../../../hooks/useTransactions';
import { SpendTag } from '../../../../types/transaction.types';
import { ApiResponse } from '../../../../types/user.types';
import { Wallet } from '../../../../types/wallet.types';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
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

interface OutflowFormProps {
  onSuccess?: () => void;
}

export default function OutflowForm({ onSuccess }: OutflowFormProps) {
  const { activeWallets, loading: walletsLoading, fetch } = useWallets();
  const { createOutflow } = useTransactions();
  const [spendTags, setSpendTags] = useState<SpendTag[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: todayIso() },
  });

  useEffect(() => {
    void fetch();
    api
      .get<ApiResponse<SpendTag[]>>(SPEND_TAG_ROUTES.list)
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
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to record outflow.';
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="outflow-form">
      <div className="space-y-2">
        <Label htmlFor="outflow-wallet">Wallet</Label>
        <Controller
          name="walletId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={walletsLoading}>
              <SelectTrigger className={cn('w-full', errors.walletId && 'border-destructive')}>
                <SelectValue placeholder="Select wallet…" />
              </SelectTrigger>
              <SelectContent>
                {activeWallets.map((w: Wallet) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name} — PKR {w.balance.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.walletId && <p className="text-xs text-destructive">{errors.walletId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>
          Spend Tag <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Controller
          name="spendTagId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || 'none'}
              onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Uncategorized" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {spendTags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="outflow-amount">Amount (PKR)</Label>
        <Input
          id="outflow-amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          className={errors.amount ? 'border-destructive' : ''}
          {...register('amount')}
        />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="outflow-note">
          Note <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <textarea
          id="outflow-note"
          rows={2}
          placeholder="Any additional notes…"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
          {...register('note')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="outflow-date">Date</Label>
        <Input id="outflow-date" type="date" className={errors.date ? 'border-destructive' : ''} {...register('date')} />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full gap-2 bg-rose-600 hover:bg-rose-700 text-white"
        size="lg"
        disabled={isSubmitting}
        id="outflow-submit"
      >
        <ArrowUpRight className="size-4" />
        {isSubmitting ? 'Saving…' : 'Record Outflow'}
      </Button>
    </form>
  );
}
