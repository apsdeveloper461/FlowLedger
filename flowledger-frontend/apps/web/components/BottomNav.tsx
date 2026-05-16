'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BookOpen,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

const NAV_ITEMS = [
  { href: '/flowboard', label: 'Board', icon: LayoutDashboard },
  { href: '/inflow', label: 'Inflow', icon: ArrowDownLeft },
  { href: '/outflow', label: 'Outflow', icon: ArrowUpRight },
  { href: '/transfer', label: 'Transfer', icon: ArrowLeftRight },
  { href: '/ledger', label: 'Ledger', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
      <div className="flex items-center justify-around py-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
              id={`bottom-nav-${item.label.toLowerCase()}`}
            >
              <Icon className={cn('size-5', isActive && 'stroke-[2.5]')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
