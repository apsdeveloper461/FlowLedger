'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowDownLeft } from 'lucide-react';
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

const schema = z.object({
  walletId: z.string().uuid('Select a wallet'),
  amount: z.coerce.number().positive('Amount must be positive').max(99999999.99),
  sourceLabel: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
  date: z.string().min(1, 'Date is required'),
});

type FormData = z.infer<typeof schema>;

interface InflowFormProps {
  onSuccess?: () => void;
}

export default function InflowForm({ onSuccess }: InflowFormProps) {
  const { activeWallets, loading: walletsLoading, fetch } = useWallets();
  const { createInflow } = useTransactions();

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
  }, []);

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
      onSuccess?.();
    } catch {
      toast.error('Failed to record inflow. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="inflow-form">
      <div className="space-y-2">
        <Label htmlFor="inflow-wallet">Wallet</Label>
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
        <Label htmlFor="inflow-amount">Amount (PKR)</Label>
        <Input
          id="inflow-amount"
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
        <Label htmlFor="inflow-source">
          Source <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input id="inflow-source" placeholder="e.g. Salary, Freelance" {...register('sourceLabel')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inflow-note">
          Note <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <textarea
          id="inflow-note"
          rows={2}
          placeholder="Any additional notes…"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
          {...register('note')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inflow-date">Date</Label>
        <Input id="inflow-date" type="date" className={errors.date ? 'border-destructive' : ''} {...register('date')} />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        size="lg"
        disabled={isSubmitting}
        id="inflow-submit"
      >
        <ArrowDownLeft className="size-4" />
        {isSubmitting ? 'Saving…' : 'Record Inflow'}
      </Button>
    </form>
  );
}