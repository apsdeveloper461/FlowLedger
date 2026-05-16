import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import ResetPasswordForm from './_components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password — FlowLedger',
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Set new password
        </h1>
        <p className="text-muted-foreground text-sm">
          Choose a strong password for your account
        </p>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-xl" />}>
        <ResetPasswordForm />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
