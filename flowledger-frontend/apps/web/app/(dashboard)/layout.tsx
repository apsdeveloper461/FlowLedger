import type { Metadata } from 'next';
import { Sidebar } from '../../components/Sidebar';
import { BottomNav } from '../../components/BottomNav';

export const metadata: Metadata = {
  title: { template: '%s — FlowLedger', default: 'FlowLedger' },
  description: 'Track every rupee. Visualize every flow.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
