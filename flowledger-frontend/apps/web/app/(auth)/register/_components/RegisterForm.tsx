'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
  const { register: registerUser, loading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ fullName, email, password }: FormData) => {
    try {
      await registerUser({ fullName, email, password });
    } catch {
      // handled by hook
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-5">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
        <Field
          id="register-name"
          label="Full name"
          type="text"
          placeholder="Ali Hassan"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Field
          id="register-email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Field
          id="register-password"
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Field
          id="register-confirm"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
          id="register-submit"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </div>
  );
}

// Reusable field
function Field({
  id,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input
        id={id}
        className={cn(
          'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-all',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          error ? 'border-destructive' : 'border-border',
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
