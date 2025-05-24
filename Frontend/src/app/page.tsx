'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DotGridBackground = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        // Move the background grid slightly with the cursor
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 -z-10">
      <svg width="100%" height="100%" className="w-full h-full" style={{ opacity: 0.22 }}>
        <defs>
          <pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#6ee7b7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>
    </div>
  );
};


// Feature card component
const FeatureCard = ({
  title,
  description,
  icon: Icon,
  className,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  className?: string;
}) => (
  <div
    className={cn(
      'group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md',
      className
    )}
  >
    <div className="absolute right-4 top-4 rounded-full bg-primary/10 p-2 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

import HomeRedirect from './home-redirect';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden">
      <HomeRedirect />
      <DotGridBackground />

      {/* Navigation */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            CodeRush
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center pt-20 pb-32 text-center">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl"
          >
            <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl">
              Build your next big thing with CodeRush
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              A modern development platform that helps you build, deploy, and manage your applications with ease.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="glow-border" asChild>
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="glow-border" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful Features
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to build modern web applications
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Blazing Fast"
              description="Built with Next.js for optimal performance and speed."
              icon={ArrowRight}
            />
            <FeatureCard
              title="Type Safe"
              description="Full TypeScript support for better developer experience."
              icon={ArrowRight}
            />
            <FeatureCard
              title="Responsive Design"
              description="Looks great on all devices, from mobile to desktop."
              icon={ArrowRight}
            />
            <FeatureCard
              title="Dark Mode"
              description="Beautiful dark theme with automatic system preference detection."
              icon={ArrowRight}
            />
            <FeatureCard
              title="Authentication"
              description="Secure user authentication with NextAuth.js."
              icon={ArrowRight}
            />
            <FeatureCard
              title="Realtime Updates"
              description="Keep your data in sync with realtime updates."
              icon={ArrowRight}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 py-12 backdrop-blur-sm">
        <div className="container px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Connect
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} CodeRush. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
