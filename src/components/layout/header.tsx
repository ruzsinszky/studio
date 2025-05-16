
'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bell, UserCircle } from 'lucide-react';

export default function AppHeader() {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === '/') return 'Daily Stand-up Board';
    if (pathname === '/backlog') return 'Backlog Tracker';
    if (pathname === '/anonymize') return 'Text Anonymizer';
    if (pathname === '/sap-architecture') return 'SAP Architecture Support';
    return 'Standuply';
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">{getPageTitle()}</h2>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="User Profile">
          <UserCircle className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
