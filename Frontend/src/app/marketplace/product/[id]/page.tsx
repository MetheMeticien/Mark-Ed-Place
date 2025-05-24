'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/config/config';
import { ArrowLeft, ShoppingCart, Heart } from 'lucide-react';

// Mock data for products (same as in marketplace page)
const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'Introduction to Calculus',
    description: 'A comprehensive guide to calculus fundamentals. This textbook covers limits, derivatives, integrals, and applications of calculus in various fields. Perfect for undergraduate students and self-learners.',
    price: 25.99,
    seller: 'Math Guru',
    sellerId: 'user123',
    category: 'Books',
    condition: 'Like New',
    location: 'Campus Library',
    postedDate: '2025-05-01',
    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Calculus+Book'
  },
  {
    id: '2',
    title: 'Physics Lab Equipment',
    description: 'Essential tools for physics experiments. This kit includes a digital multimeter, oscilloscope, various sensors, and other components needed for conducting physics experiments. Ideal for physics students and hobbyists.',
    price: 149.99,
    seller: 'Science Supplies',
    sellerId: 'user456',
    category: 'Equipment',
    condition: 'Good',
    location: 'Science Building',
    postedDate: '2025-04-28',
    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Lab+Equipment'
  },
  // Other products from the marketplace page...
];

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  
  // Find the product based on the ID from the URL
  const product = MOCK_PRODUCTS.find(p => p.id === params.id);
  
  // If product not found, show error
  if (!product) {
    return (
      <div className="container flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="mt-2 text-muted-foreground">The product you're looking for doesn't exist.</p>
          <Button 
            className="mt-4" 
            onClick={() => router.push(ROUTES.MARKETPLACE)}
          >
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Implement add to cart functionality
    console.log(`Added ${quantity} of ${product.title} to cart`);
    // Show success message or redirect to cart
  };

  const handleContactSeller = () => {
    // Implement contact seller functionality
    console.log(`Contacting seller ${product.seller}`);
  };

  return (
    <div className="container py-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-1"
        onClick={() => router.push(ROUTES.MARKETPLACE)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Button>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="overflow-hidden rounded-lg border">
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>
        
        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="mt-2 text-2xl font-semibold">${product.price.toFixed(2)}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              className="flex-1" 
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button variant="outline">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <p><span className="font-semibold">Condition:</span> {product.condition}</p>
            <p><span className="font-semibold">Category:</span> {product.category}</p>
            <p><span className="font-semibold">Location:</span> {product.location}</p>
            <p><span className="font-semibold">Posted:</span> {product.postedDate}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Seller Information</h3>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div>
                <p className="font-medium">{product.seller}</p>
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-sm"
                  onClick={handleContactSeller}
                >
                  Contact Seller
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Description and Details Tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-4 rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">Product Description</h3>
          <p className="text-muted-foreground">{product.description}</p>
        </TabsContent>
        <TabsContent value="details" className="mt-4 rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">Product Details</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li><span className="font-medium">Category:</span> {product.category}</li>
            <li><span className="font-medium">Condition:</span> {product.condition}</li>
            <li><span className="font-medium">Location:</span> {product.location}</li>
            <li><span className="font-medium">Seller:</span> {product.seller}</li>
            <li><span className="font-medium">Posted Date:</span> {product.postedDate}</li>
          </ul>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4 rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">Reviews</h3>
          <p className="text-muted-foreground">No reviews yet.</p>
        </TabsContent>
      </Tabs>
      
      {/* Related Products */}
      <section className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {MOCK_PRODUCTS.filter(p => p.id !== params.id && p.category === product.category)
            .slice(0, 4)
            .map(relatedProduct => (
              <Card key={relatedProduct.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{relatedProduct.title}</h3>
                  <p className="mt-2 font-medium">${relatedProduct.price.toFixed(2)}</p>
                  <Button 
                    className="mt-3 w-full"
                    variant="outline"
                    onClick={() => router.push(`${ROUTES.PRODUCT}/${relatedProduct.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>
    </div>
  );
}
