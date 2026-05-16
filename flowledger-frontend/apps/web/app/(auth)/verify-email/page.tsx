import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import VerifyEmailClient from './_components/VerifyEmailClient';

export const metadata: Metadata = {
  title: 'Verify Email — FlowLedger',
  description: 'Enter your OTP to verify your FlowLedger email address.',
};

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="text-3xl">📬</span>
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="text-muted-foreground text-sm">
          We sent a 6-digit OTP to your email. It expires in 10 minutes.
        </p>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-xl" />}>
        <VerifyEmailClient />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        Wrong account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
