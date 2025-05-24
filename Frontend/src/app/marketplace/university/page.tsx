'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/config/config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthContext } from '@/components/providers/auth-provider';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { universityApi, University } from '@/lib/university-api';
import { productApi, Product } from '@/lib/product-api';
import { toast } from '@/components/ui/use-toast';

// Fallback image for products without images
const FALLBACK_IMAGE = 'https://placehold.co/300x200/e2e8f0/1e293b?text=No+Image';

// Categories for filtering
const CATEGORIES = ['All', 'Books', 'Equipment', 'Accessories', 'Supplies'];

export default function UniversityMarketplacePage() {
  const { user, isAuthenticated } = useAuthContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [university, setUniversity] = useState<University | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [accessDenied, setAccessDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);
  
  useEffect(() => {
    const fetchUniversityData = async () => {
      try {
        // Check if user is authenticated and has a university ID
        if (!isAuthenticated || !user?.university_id) {
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }
        
        // Get university ID from URL
        const urlUniversityId = searchParams.get('university_id');
        
        // If no university ID in URL or it doesn't match the user's university ID, deny access
        if (!urlUniversityId || urlUniversityId !== user.university_id) {
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }
        
        // Fetch university data from API
        const universityResponse = await universityApi.getUniversity(urlUniversityId);
        
        if (universityResponse.error) {
          throw new Error(universityResponse.error.message);
        }
        
        if (universityResponse.data) {
          setUniversity(universityResponse.data);
          
          // Fetch products for this university
          const productsResponse = await universityApi.getUniversityProducts(urlUniversityId);
          
          if (productsResponse.error) {
            throw new Error(productsResponse.error.message);
          }
          
          if (productsResponse.data) {
            setProducts(productsResponse.data);
            
            // Extract unique categories from products
            const uniqueCategories = new Set<string>();
            uniqueCategories.add('All');
            
            productsResponse.data.forEach(product => {
              if (product.category) {
                uniqueCategories.add(product.category);
              }
            });
            
            setCategories(Array.from(uniqueCategories));
          }
        }
      } catch (error) {
        console.error('Error fetching university data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load university data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUniversityData();
  }, [isAuthenticated, user, searchParams]);
  
  // Filter products by category
  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(product => product.category === activeCategory);

  // If access is denied, show an error message
  if (accessDenied) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to view this university marketplace. Please make sure you're logged in and accessing your own university.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => router.push(ROUTES.MARKETPLACE)}>
            Return to Marketplace
          </Button>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <span className="ml-2">Loading university marketplace...</span>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <section className="mb-12 rounded-lg bg-muted p-6 text-center md:p-12">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">University Marketplace</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Find products from students at your university
        </p>
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
          <div className="text-xl font-semibold">
            {university?.name || 'Your University'}
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <Tabs defaultValue="All" className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {university ? `Products at ${university.name}` : 'University Products'}
          </h2>
          <TabsList>
            {categories.map(category => (
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
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map(product => (
                <Link href={`${ROUTES.PRODUCT}/${product.id}`} key={product.id}>
                  <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={product.image || FALLBACK_IMAGE}
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
                    <CardFooter className="flex flex-col items-start border-t p-4 pt-2">
                      <p className="text-xs text-muted-foreground">Condition: {product.condition || 'Not specified'}</p>
                      <p className="text-xs text-muted-foreground">Location: {product.location || 'Not specified'}</p>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-lg text-muted-foreground">No products found for the selected filters.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setActiveCategory('All');
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
