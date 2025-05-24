'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/config/config';
import { productApi, Product } from '@/lib/product-api';
import { toast } from '@/components/ui/use-toast';
// Fallback image for products without images
const FALLBACK_IMAGE = 'https://placehold.co/300x200/e2e8f0/1e293b?text=No+Image';

// Categories for filtering
const CATEGORIES = ['All', 'Books', 'Equipment', 'Accessories', 'Supplies', 'Electronics', 'Clothing', 'Furniture', 'Other'];

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await productApi.getProducts();
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        if (response.data) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Filter products by category
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category === activeCategory);

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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <span className="ml-2">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">No products found in this category.</p>
              <Link href={`${ROUTES.MARKETPLACE}/sell`} className="mt-4 inline-block">
                <Button>Add Your First Product</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map(product => (
                <Link href={`${ROUTES.PRODUCT}/${product.id}`} key={product.id}>
                  <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={product.image && product.image.length > 0 ? product.image[0] : FALLBACK_IMAGE}
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
                      <p className="text-xs text-muted-foreground">Location: {product.location}</p>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
