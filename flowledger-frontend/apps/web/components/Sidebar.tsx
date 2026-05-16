'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@workspace/ui/lib/utils';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { href: '/flowboard', label: 'FlowBoard', icon: '📊' },
  { href: '/inflow', label: 'Inflow', icon: '💰' },
  { href: '/outflow', label: 'Outflow', icon: '💸' },
  { href: '/transfer', label: 'Transfer', icon: '🔄' },
  { href: '/ledger', label: 'Flow Ledger', icon: '📒' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-sm">FL</span>
        </div>
        <div>
          <p className="font-heading font-semibold leading-none">FlowLedger</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Track every rupee</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
              id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border px-3 py-4">
        <button
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
          id="logout-btn"
        >
          <span className="text-base leading-none">🚪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
