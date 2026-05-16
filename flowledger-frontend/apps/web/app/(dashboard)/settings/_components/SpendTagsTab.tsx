'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import api from '../../../../lib/axios';
import { SPEND_TAG_ROUTES } from '../../../../constants/apiRoutes';
import { SpendTag } from '../../../../types/transaction.types';
import { ApiResponse } from '../../../../types/user.types';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

const PRESET_COLORS = ['#f43f5e','#f97316','#f59e0b','#84cc16','#10b981','#06b6d4','#3b82f6','#8b5cf6'];

const schema = z.object({
  name: z.string().min(1).max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

type FormData = z.infer<typeof schema>;

export default function SpendTagsTab() {
  const [tags, setTags] = useState<SpendTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SpendTag | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { color: PRESET_COLORS[0] },
  });

  const selectedColor = watch('color');

  const loadTags = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<SpendTag[]>>(SPEND_TAG_ROUTES.list);
      setTags(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadTags(); }, []);

  useEffect(() => {
    if (editing) reset({ name: editing.name, color: editing.color });
    else reset({ color: PRESET_COLORS[0] });
  }, [editing]);

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await api.patch(SPEND_TAG_ROUTES.detail(editing.id), data);
        toast.success('Spend tag updated!');
      } else {
        await api.post(SPEND_TAG_ROUTES.list, data);
        toast.success('Spend tag created!');
      }
      await loadTags();
      setShowForm(false);
      setEditing(null);
    } catch { toast.error('Failed to save spend tag.'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this spend tag?')) return;
    try {
      await api.delete(SPEND_TAG_ROUTES.detail(id));
      setTags((prev) => prev.filter((t) => t.id !== id));
      toast.success('Spend tag deleted.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Cannot delete — has transactions.';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Spend Tags</h2>
        <Button size="sm" id="add-tag-btn" onClick={() => { setEditing(null); setShowForm(true); }}>
          + Add Tag
        </Button>
      </div>

      {(showForm || editing) && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-sm">{editing ? 'Edit Spend Tag' : 'New Spend Tag'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="spend-tag-form">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Name</label>
              <input
                className={cn('w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20', errors.name ? 'border-destructive' : 'border-border')}
                placeholder="e.g. Food & Dining"
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

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

            {/* Preview */}
            <div className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedColor }} />
              <span className="text-muted-foreground">Preview:</span>
              <span className="font-medium">{watch('name') || 'Tag name'}</span>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSubmitting} id="tag-save-btn">
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Tags list */}
      <div className="space-y-2">
        {loading ? (
          Array(4).fill(null).map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted/40 animate-pulse" />)
        ) : tags.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">No spend tags yet.</p>
        ) : tags.map((tag) => (
          <div key={tag.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
              <span className="font-medium text-sm">{tag.name}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(tag); setShowForm(false); }} id={`edit-tag-${tag.id}`}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(tag.id)} id={`delete-tag-${tag.id}`}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
