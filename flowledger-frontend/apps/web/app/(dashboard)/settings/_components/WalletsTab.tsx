'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useWallets } from '../../../../hooks/useWallets';
import { Wallet } from '../../../../types/wallet.types';
import { WALLET_TYPES } from '../../../../constants/walletTypes';
import { Button } from '@workspace/ui/components/button';
import { formatPKR } from '../../../../lib/formatCurrency';
import { cn } from '@workspace/ui/lib/utils';

const PRESET_COLORS = ['#3b82f6','#10b981','#f59e0b','#f43f5e','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

const walletSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['bank','cash','mobile_wallet','other']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color'),
  initialBalance: z.coerce.number().min(0).optional(),
});

type WalletForm = z.infer<typeof walletSchema>;

export default function WalletsTab() {
  const { wallets, loading, fetch, create, update, archive, remove } = useWallets();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<WalletForm>({
    resolver: zodResolver(walletSchema),
    defaultValues: { color: PRESET_COLORS[0], type: 'bank' },
  });

  const selectedColor = watch('color');

  useEffect(() => { void fetch(); }, []);

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name, type: editing.type, color: editing.color });
    } else {
      reset({ color: PRESET_COLORS[0], type: 'bank' });
    }
  }, [editing]);

  const onSubmit = async (data: WalletForm) => {
    try {
      if (editing) {
        await update(editing.id, data);
        toast.success('Wallet updated!');
      } else {
        await create({ ...data, initialBalance: data.initialBalance ?? 0 });
        toast.success('Wallet created!');
      }
      setShowForm(false);
      setEditing(null);
    } catch {
      toast.error('Failed to save wallet.');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archive(id);
      toast.success('Wallet archived.');
    } catch { toast.error('Failed to archive.'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this wallet? This cannot be undone.')) return;
    try {
      await remove(id);
      toast.success('Wallet deleted.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Cannot delete — has transactions.';
      toast.error(msg);
    }
  };

  const inputCls = (err?: string) => cn(
    'w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20',
    err ? 'border-destructive' : 'border-border',
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Your Wallets</h2>
        <Button size="sm" id="add-wallet-btn" onClick={() => { setEditing(null); setShowForm(true); }}>
          + Add Wallet
        </Button>
      </div>

      {/* Form */}
      {(showForm || editing) && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-sm">{editing ? 'Edit Wallet' : 'New Wallet'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="wallet-form">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Name</label>
                <input className={inputCls(errors.name?.message)} placeholder="e.g. HBL Savings" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Type</label>
                <select className={inputCls()} {...register('type')}>
                  {Object.entries(WALLET_TYPES).map(([k, v]: [string, any]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {!editing && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Initial Balance (PKR)</label>
                <input type="number" min="0" step="0.01" placeholder="0.00" className={inputCls()} {...register('initialBalance')} />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue('color', c)}
                    className={cn('h-8 w-8 rounded-full transition-all', selectedColor === c && 'ring-2 ring-offset-2 ring-primary')}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input type="color" className="h-8 w-8 rounded-full cursor-pointer border-none" value={selectedColor} onChange={(e) => setValue('color', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSubmitting} id="wallet-save-btn">
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Wallet list */}
      <div className="space-y-3">
        {loading ? (
          Array(3).fill(null).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
          ))
        ) : wallets.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">No wallets yet. Add your first wallet above.</p>
        ) : wallets.map((w: Wallet) => (
          <div
            key={w.id}
            className={cn(
              'flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-opacity',
              w.isArchived && 'opacity-50',
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: w.color }}>
                {w.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{w.name}</p>
                <p className="text-xs text-muted-foreground">
                  {WALLET_TYPES[w.type].label} · {formatPKR(w.balance)}
                  {w.isArchived && ' · Archived'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!w.isArchived && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(w); setShowForm(false); }} id={`edit-wallet-${w.id}`}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleArchive(w.id)} id={`archive-wallet-${w.id}`}>Archive</Button>
                </>
              )}
              <Button size="sm" variant="destructive" onClick={() => handleDelete(w.id)} id={`delete-wallet-${w.id}`}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
