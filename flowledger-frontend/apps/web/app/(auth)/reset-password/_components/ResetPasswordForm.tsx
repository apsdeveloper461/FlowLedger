'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordForm({ resetToken: tokenProp }: { resetToken?: string }) {
  const params = useSearchParams();
  const resetToken = tokenProp ?? params.get('token') ?? '';
  const { resetPassword, loading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ newPassword }: FormData) => {
    try {
      await resetPassword(resetToken, newPassword);
    } catch {
      // handled
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-5">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="reset-password-form">
        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-sm font-medium">New password</label>
          <input
            id="new-password"
            type="password"
            placeholder="Min 8 characters"
            autoComplete="new-password"
            className={cn(
              'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-all',
              'focus:border-primary focus:ring-2 focus:ring-primary/20',
              errors.newPassword ? 'border-destructive' : 'border-border',
            )}
            {...register('newPassword')}
          />
          {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirm-new-password" className="text-sm font-medium">Confirm password</label>
          <input
            id="confirm-new-password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className={cn(
              'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-all',
              'focus:border-primary focus:ring-2 focus:ring-primary/20',
              errors.confirmPassword ? 'border-destructive' : 'border-border',
            )}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading || !resetToken} id="reset-password-submit">
          {loading ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>
    </div>
  );
}
