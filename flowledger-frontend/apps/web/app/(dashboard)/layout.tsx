import type { Metadata } from 'next';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@workspace/ui/components/sidebar';
import { Separator } from '@workspace/ui/components/separator';
import { AppSidebar } from '../../components/app-sidebar';
import { BottomNav } from '../../components/BottomNav';

export const metadata: Metadata = {
  title: { template: '%s — FlowLedger', default: 'FlowLedger' },
  description: 'Track every rupee. Visualize every flow.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="h-4" />
          <span className="font-heading text-sm font-semibold">FlowLedger</span>
        </header>
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
