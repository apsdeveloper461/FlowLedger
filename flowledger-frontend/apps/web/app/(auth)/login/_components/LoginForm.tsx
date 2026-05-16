'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const { login, loading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
    } catch {
      // error is handled by useAuth hook state
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-5">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="login-form">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-medium">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(
              'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-all',
              'focus:border-primary focus:ring-2 focus:ring-primary/20',
              errors.email ? 'border-destructive' : 'border-border',
            )}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium">
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(
              'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-all',
              'focus:border-primary focus:ring-2 focus:ring-primary/20',
              errors.password ? 'border-destructive' : 'border-border',
            )}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
          id="login-submit"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
