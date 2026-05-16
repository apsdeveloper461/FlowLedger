'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeftRight } from 'lucide-react';
import { useWallets } from '../../../../hooks/useWallets';
import { useTransactions } from '../../../../hooks/useTransactions';
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

const schema = z
  .object({
    fromWalletId: z.string().uuid('Select source wallet'),
    toWalletId: z.string().uuid('Select destination wallet'),
    amount: z.coerce.number().positive().max(99999999.99),
    fee: z.coerce.number().min(0).max(99999.99).optional(),
    note: z.string().max(500).optional(),
    date: z.string().min(1),
  })
  .refine((d) => d.fromWalletId !== d.toWalletId, {
    message: 'Source and destination must be different',
    path: ['toWalletId'],
  });

type FormData = z.infer<typeof schema>;

interface TransferFormProps {
  onSuccess?: () => void;
}

export default function TransferForm({ onSuccess }: TransferFormProps) {
  const { activeWallets, loading: walletsLoading, fetch } = useWallets();
  const { createTransfer } = useTransactions();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: todayIso(), fee: 0 },
  });

  useEffect(() => {
    void fetch();
  }, []);

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
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Transfer failed.';
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="transfer-form">
      <div className="space-y-2">
        <Label htmlFor="transfer-from">From Wallet</Label>
        <Controller
          name="fromWalletId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={walletsLoading}>
              <SelectTrigger className={cn('w-full', errors.fromWalletId && 'border-destructive')}>
                <SelectValue placeholder="Select source wallet…" />
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
        {errors.fromWalletId && <p className="text-xs text-destructive">{errors.fromWalletId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transfer-to">To Wallet</Label>
        <Controller
          name="toWalletId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={walletsLoading}>
              <SelectTrigger className={cn('w-full', errors.toWalletId && 'border-destructive')}>
                <SelectValue placeholder="Select destination wallet…" />
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
        {errors.toWalletId && <p className="text-xs text-destructive">{errors.toWalletId.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="transfer-amount">Amount (PKR)</Label>
          <Input
            id="transfer-amount"
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
          <Label htmlFor="transfer-fee">
            Fee <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="transfer-fee" type="number" step="0.01" min="0" placeholder="0.00" {...register('fee')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transfer-note">
          Note <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <textarea
          id="transfer-note"
          rows={2}
          placeholder="Transfer reason…"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
          {...register('note')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="transfer-date">Date</Label>
        <Input id="transfer-date" type="date" className={errors.date ? 'border-destructive' : ''} {...register('date')} />
      </div>

      <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting} id="transfer-submit">
        <ArrowLeftRight className="size-4" />
        {isSubmitting ? 'Processing…' : 'Execute Transfer'}
      </Button>
    </form>
  );
}
