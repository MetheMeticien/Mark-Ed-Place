'use client';

import Link from 'next/link';
import { useAuthContext } from '../providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/config/config';
import { ShoppingCart, User, Search } from 'lucide-react';
import { useState } from 'react';
import { ModeToggle } from '@/components/mode-toggle';

export function MarketplaceNavbar() {
  const { user, logout } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href={ROUTES.MARKETPLACE} className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Mark-Ed-Place</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden flex-1 items-center justify-center px-4 md:flex">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-md bg-background pl-8 md:w-[300px] lg:w-[600px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <nav className="flex items-center gap-2">
          <Link href={ROUTES.PROFILE}>
            <Button variant="ghost" size="icon" aria-label="Profile">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/marketplace/cart">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
          <ModeToggle />
          <Button variant="outline" size="sm" onClick={() => logout()}>
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
}
