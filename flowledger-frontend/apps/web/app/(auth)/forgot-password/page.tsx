import type { Metadata } from 'next';
import Link from 'next/link';
import ForgotPasswordForm from './_components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password — FlowLedger',
  description: 'Reset your FlowLedger password.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Forgot password?
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset OTP
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
