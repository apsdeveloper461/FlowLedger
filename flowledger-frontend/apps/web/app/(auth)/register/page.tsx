import type { Metadata } from 'next';
import Link from 'next/link';
import RegisterForm from './_components/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account — FlowLedger',
  description: 'Create your FlowLedger account and start tracking every rupee.',
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          Start tracking every rupee with FlowLedger
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
