'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/config/config';

// Mock data for products
const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'Introduction to Calculus',
    description: 'A comprehensive guide to calculus fundamentals',
    price: 25.99,
    seller: 'Math Guru',
    category: 'Books',
    image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Calculus+Book'
  },
  {
    id: '2',
    title: 'Physics Lab Equipment',
    description: 'Essential tools for physics experiments',
    price: 149.99,
    seller: 'Science Supplies',
    category: 'Equipment',
    image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Lab+Equipment'
  },
  {
    id: '3',
    title: 'Programming Fundamentals',
    description: 'Learn the basics of coding with this beginner-friendly guide',
    price: 19.99,
    seller: 'Code Master',
    category: 'Books',
    image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Programming+Book'
  },
  {
    id: '4',
    title: 'Graphing Calculator',
    description: 'Advanced calculator for math and science courses',
    price: 89.99,
    seller: 'Tech Tools',
    category: 'Equipment',
    image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Calculator'
  },
  {
    id: '5',
    title: 'Chemistry Study Guide',
    description: 'Comprehensive review for chemistry exams',
    price: 22.50,
    seller: 'Science Scholar',
    category: 'Books',
    image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Chemistry+Guide'
  },
  {
    id: '6',
    title: 'Laptop Stand',
    description: 'Ergonomic stand for better posture during long study sessions',
    price: 34.99,
    seller: 'Ergo Solutions',
    category: 'Accessories',
    image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Laptop+Stand'
  },
  {
    id: '7',
    title: 'Wireless Headphones',
    description: 'Noise-cancelling headphones for distraction-free studying',
    price: 79.99,
    seller: 'Audio Tech',
    category: 'Accessories',
    image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Headphones'
  },
  {
    id: '8',
    title: 'Art Supplies Set',
    description: 'Complete set of art supplies for creative projects',
    price: 45.00,
    seller: 'Creative Corner',
    category: 'Supplies',
    image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Art+Supplies'
  }
];

// Categories for filtering
const CATEGORIES = ['All', 'Books', 'Equipment', 'Accessories', 'Supplies'];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const filteredProducts = activeCategory === 'All' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(product => product.category === activeCategory);

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <section className="mb-12 rounded-lg bg-muted p-6 text-center md:p-12">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Student Marketplace</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Buy and sell academic resources, equipment, and more with fellow students
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Button size="lg">Browse Products</Button>
          <Link href={`${ROUTES.MARKETPLACE}/sell`}>
            <Button size="lg" variant="outline">Sell Your Items</Button>
          </Link>
        </div>
      </section>

      {/* University Marketplace Section */}
      <section className="mb-12 rounded-lg border p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">University Marketplace</h2>
            <p className="text-muted-foreground">
              Find products from students at your university. Connect with peers and discover resources specific to your campus.
            </p>
          </div>
          <Link href={ROUTES.UNIVERSITY_MARKETPLACE}>
            <Button size="lg" className="whitespace-nowrap">
              Go to University Marketplace
            </Button>
          </Link>
        </div>
      </section>

      {/* Category Tabs */}
      <Tabs defaultValue="All" className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Products</h2>
          <TabsList>
            {CATEGORIES.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {/* Products Grid */}
        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(product => (
              <Link href={`${ROUTES.PRODUCT}/${product.id}`} key={product.id}>
                <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                    <p className="mt-2 font-medium">${product.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter className="border-t p-4 pt-2">
                    <p className="text-xs text-muted-foreground">Sold by: {product.seller}</p>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
