'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';

const NAV_ITEMS = [
  { href: '/flowboard', label: 'FlowBoard', icon: '📊' },
  { href: '/inflow', label: 'Inflow', icon: '💰' },
  { href: '/outflow', label: 'Outflow', icon: '💸' },
  { href: '/transfer', label: 'Transfer', icon: '🔄' },
  { href: '/ledger', label: 'Ledger', icon: '📒' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-sidebar md:hidden">
      <div className="flex items-center justify-around py-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
              id={`bottom-nav-${item.label.toLowerCase()}`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
