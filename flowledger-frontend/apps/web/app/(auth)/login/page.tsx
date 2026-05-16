import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from './_components/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — FlowLedger',
  description: 'Sign in to your FlowLedger account.',
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to your account to continue
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
