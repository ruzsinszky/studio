import type { ReactNode } from 'react';
import AppSidebar from './sidebar';
import AppHeader from './header';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
