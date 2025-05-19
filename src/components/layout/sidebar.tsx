
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, LayoutDashboard, CalendarDays, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Daily Stand-up', icon: CalendarDays },
  { href: '/backlog', label: 'Backlog Tracker', icon: LayoutDashboard },
  { href: '/sap-architecture', label: 'SAP Support', icon: ShieldCheck },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar-background text-sidebar-foreground p-4 flex flex-col shadow-lg">
      <div className="flex items-center gap-2 mb-8 p-2">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Standuply</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md p-3 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  pathname === item.href
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto p-2">
        <p className="text-xs text-sidebar-foreground/70">&copy; {new Date().getFullYear()} Standuply</p>
      </div>
    </aside>
  );
}
