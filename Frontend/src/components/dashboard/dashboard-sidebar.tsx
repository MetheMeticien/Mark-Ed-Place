'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, BarChart, Users, LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/components/providers/auth-provider';

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, isLoading } = useAuthContext();

  return (
    <div className="hidden w-64 border-r bg-background md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">CodeRush</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={logout}
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoading ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </div>
  );
}
