'use client';

import { BookOpen } from 'lucide-react';
import { AnimatedPage } from '../../../components/animated-page';
import LedgerClient from './_components/LedgerClient';

export default function LedgerPage() {
  return (
    <AnimatedPage className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="size-7 text-primary" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Flow Ledger</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Your complete transaction history</p>
      </div>
      <LedgerClient />
    </AnimatedPage>
  );
}
