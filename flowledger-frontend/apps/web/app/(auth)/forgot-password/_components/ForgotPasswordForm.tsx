'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import ResetPasswordForm from '../../reset-password/_components/ResetPasswordForm';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  otp: z.string().length(6, 'Enter the 6-digit OTP'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const { forgotPassword, verifyResetOtp, loading, error } = useAuth();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [sent, setSent] = useState(false);

  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.string().email() })),
  });

  const otpForm = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email, otp: '' },
  });

  const sendOtp = async (data: { email: string }) => {
    try {
      await forgotPassword(data.email);
      setEmail(data.email);
      setSent(true);
      setStep('otp');
    } catch {
      // handled
    }
  };

  const verifyOtp = async (data: FormData) => {
    try {
      const token = await verifyResetOtp(data.email, data.otp);
      if (token) {
        setResetToken(token);
        setStep('reset');
      }
    } catch {
      // handled
    }
  };

  if (step === 'reset') {
    return <ResetPasswordForm resetToken={resetToken} />;
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-5">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {step === 'email' && (
        <form onSubmit={emailForm.handleSubmit(sendOtp)} className="space-y-4" id="forgot-password-form">
          <div className="space-y-1.5">
            <label htmlFor="forgot-email" className="text-sm font-medium">Email address</label>
            <input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              className={cn(
                'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-all',
                'focus:border-primary focus:ring-2 focus:ring-primary/20',
                emailForm.formState.errors.email ? 'border-destructive' : 'border-border',
              )}
              {...emailForm.register('email')}
            />
            {emailForm.formState.errors.email && (
              <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading} id="send-reset-otp">
            {loading ? 'Sending…' : 'Send reset OTP'}
          </Button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={otpForm.handleSubmit(verifyOtp)} className="space-y-4" id="verify-reset-form">
          <p className="text-sm text-center text-muted-foreground">
            OTP sent to <span className="font-medium text-foreground">{email}</span>
          </p>
          <div className="space-y-1.5">
            <label htmlFor="reset-otp" className="text-sm font-medium">6-digit OTP</label>
            <input
              id="reset-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className={cn(
                'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-all text-center tracking-widest text-lg font-bold',
                'focus:border-primary focus:ring-2 focus:ring-primary/20 border-border',
              )}
              {...otpForm.register('otp')}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading} id="verify-reset-otp">
            {loading ? 'Verifying…' : 'Verify OTP'}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-muted-foreground hover:text-primary"
            onClick={() => setStep('email')}
          >
            ← Back
          </button>
        </form>
      )}
    </div>
  );
}
