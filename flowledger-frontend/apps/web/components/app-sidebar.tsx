'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@workspace/ui/components/sidebar';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { href: '/flowboard', label: 'FlowBoard', icon: LayoutDashboard },
  { href: '/inflow', label: 'Inflow', icon: ArrowDownLeft },
  { href: '/outflow', label: 'Outflow', icon: ArrowUpRight },
  { href: '/transfer', label: 'Transfer', icon: ArrowLeftRight },
  { href: '/ledger', label: 'Flow Ledger', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/flowboard" className="flex items-center gap-3 px-2 py-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">FL</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-heading text-sm font-semibold leading-none">FlowLedger</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Track every rupee</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href} id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => void logout()}
              className="text-muted-foreground"
              id="logout-btn"
            >
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}