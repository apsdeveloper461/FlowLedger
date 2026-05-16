'use client';

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const email = params.get('email') ?? '';
  const { verifyOtp, resendOtp, loading, error } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [cooldown, setCooldown] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const focusNext = (idx: number) => {
    const next = refs.current[idx + 1];
    if (next) next.focus();
  };

  const focusPrev = (idx: number) => {
    const prev = refs.current[idx - 1];
    if (prev) prev.focus();
  };

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val) focusNext(idx);
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx]) focusPrev(idx);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    refs.current[lastIdx]?.focus();
  };

  const handleSubmit = async () => {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) return;
    try {
      await verifyOtp({ email, otp });
    } catch {
      setDigits(Array(OTP_LENGTH).fill(''));
      refs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await resendOtp(email);
      setCooldown(RESEND_COOLDOWN);
    } catch {
      // error handled by hook
    }
  };

  const otp = digits.join('');

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
      {email && (
        <p className="text-center text-sm text-muted-foreground">
          OTP sent to <span className="font-medium text-foreground">{email}</span>
        </p>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive text-center">
          {error}
        </div>
      )}

      {/* OTP input boxes */}
      <div className="flex justify-center gap-3" role="group" aria-label="OTP input">
        {digits.map((d, i) => (
          <input
            key={i}
            id={`otp-digit-${i}`}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={cn(
              'h-14 w-12 rounded-xl border-2 bg-background text-center text-xl font-bold outline-none transition-all',
              'focus:border-primary focus:ring-2 focus:ring-primary/20',
              d ? 'border-primary text-foreground' : 'border-border text-muted-foreground',
            )}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={otp.length < OTP_LENGTH || loading}
        onClick={handleSubmit}
        id="verify-otp-submit"
      >
        {loading ? 'Verifying…' : 'Verify OTP'}
      </Button>

      <div className="text-center">
        <button
          onClick={handleResend}
          disabled={cooldown > 0 || loading}
          className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          id="resend-otp-btn"
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}
