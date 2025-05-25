'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/config/config';
import { ArrowLeft, ShoppingCart, Heart, MapPin } from 'lucide-react';
import { productApi, Product } from '@/lib/product-api';
import { toast } from '@/components/ui/use-toast';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useCart } from '@/components/providers/cart-provider';
// Fallback image for products without images
const FALLBACK_IMAGE = 'https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image';

// Format date to a readable format
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Map container styles
const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

// Default center location (Dhaka, Bangladesh)
const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  // Google Maps related states
  const [meetingLocation, setMeetingLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [pendingMeetup, setPendingMeetup] = useState<any | null>(null); // For seller: pending meetup object
  const [isBuyer, setIsBuyer] = useState(true); // Hard-coded for now - true means current user is buyer
  const [meetupAccepted, setMeetupAccepted] = useState(false); // For seller: if accepted, show confirmation
  const [universities, setUniversities] = useState<any[]>([]); // Store universities data
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries: ['places']
  });
  
  // Google Maps click handler - defined at the top level
  const onMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (!isBuyer || !event.latLng || !product) return; // Only buyers can set meeting location

    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setMeetingLocation(newLocation);

    // POST to /meetups/ to create a meetup proposal
    try {
      // TODO: Replace with actual user info
      const buyer_id = 'CURRENT_BUYER_ID';
      const seller_id = product.seller_id;
      const res = await fetch('http://localhost:8000/meetups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
        body: JSON.stringify({
          product_id: product.id,
          latitude: newLocation.lat,
          longitude: newLocation.lng,
          seller_id,
        }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to create meetup proposal');
      toast({
        title: 'Meeting Location Set',
        description: 'You have marked a location for meetup with the seller.',
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || 'Failed to create meetup proposal',
        variant: 'destructive',
      });
    }
  }, [isBuyer, product]);
  
  // Save map reference when the map loads - defined at the top level
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);
  
  // Reset meeting location
  const handleResetLocation = useCallback(() => {
    setMeetingLocation(null);
    toast({
      title: 'Location Reset',
      description: 'Meeting location has been cleared.',
    });
  }, []);
  
  // Fetch product data from API
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        const response = await productApi.getProduct(params.id);

        if (response.error) {
          throw new Error(response.error.message);
        }

        if (response.data) {
          setProduct(response.data);

          // Fetch related products
          const allProductsResponse = await productApi.getProducts();
          if (allProductsResponse.data) {
            const related = allProductsResponse.data
              .filter(p => p.id !== params.id && p.category === response.data?.category)
              .slice(0, 4);
            setRelatedProducts(related);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product details. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [params.id]);

  // For seller: fetch pending meetup proposals for this product
  useEffect(() => {
    const fetchPendingMeetup = async () => {
      if (!product || isBuyer) return;
      try {
        const res = await fetch(`/meetups/product/${product.id}`, {
          credentials: 'include',
        });
        if (!res.ok) return;
        const meetups = await res.json();
        // Find pending meetup for this seller
        // TODO: Replace with actual user info
        const seller_id = 'CURRENT_SELLER_ID';
        const pending = meetups.find((m: any) => m.status === 'pending' && m.seller_id === seller_id);
        if (pending) {
          setPendingMeetup(pending);
        } else {
          setPendingMeetup(null);
        }
      } catch {
        setPendingMeetup(null);
      }
    };
    fetchPendingMeetup();

    
  }, [product, isBuyer]);

  // Fetch universities data
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:8000/universities/');
        if (!response.ok) {
          throw new Error('Failed to fetch universities');
        }
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error('Error fetching universities:', error);
        toast({
          title: 'Error',
          description: 'Failed to load universities data.',
          variant: 'destructive',
        });
      }
    };

    fetchUniversities();
  }, []);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }
  
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

  const { addItem } = useCart();
  
  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if product is in stock
    if (product.stock <= 0) {
      toast({
        title: 'Out of stock',
        description: `${product.title} is currently out of stock`,
        variant: 'destructive',
      });
      return;
    }
    
    // Check if requested quantity is available
    if (quantity > product.stock) {
      toast({
        title: 'Limited stock',
        description: `Only ${product.stock} items available. Please reduce your quantity.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Add to cart - the addItem function will handle additional stock checks
    const success = addItem(product, quantity);
    
    // If successfully added, show a success message (though this is now redundant as the cart provider shows a toast)
    if (success) {
      // Optional: You could navigate to the cart page here
      // router.push('/marketplace/cart');
    }
  };

  const handleContactSeller = () => {
    // Implement contact seller functionality
    console.log(`Contacting seller for product: ${product?.title}`);
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
            src={product.image && product.image.length > 0 ? product.image[0] : FALLBACK_IMAGE}
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
          
          <div className="space-y-2 mt-6">
            <h3 className="text-lg font-semibold">Product Information</h3>
            <p><span className="font-semibold">Condition:</span> {product.condition}</p>
            <p><span className="font-semibold">Category:</span> {product.category}</p>
            <p><span className="font-semibold">Location:</span> {product.location}</p>
            <p><span className="font-semibold">Stock:</span> {product.stock} available</p>
            <p><span className="font-semibold">Posted:</span> {product.created_at ? formatDate(product.created_at) : 'N/A'}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Seller Information</h3>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div>
                <p className="font-medium">University ID: {product.university_id || 'N/A'}</p>
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

      {/* Meeting Location Map */}
      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Meeting Location</h2>
        <div className="rounded-lg border overflow-hidden">
          {!isLoaded ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                <p className="text-lg">Loading map...</p>
              </div>
            </div>
          ) : loadError ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100">
              <p className="text-red-500">Error loading Google Maps</p>
            </div>
          ) : (
            <div className="relative">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={(() => {
                  if (isBuyer && meetingLocation) return meetingLocation;
                  if (!isBuyer && pendingMeetup) return { lat: pendingMeetup.latitude, lng: pendingMeetup.longitude };
                  if (product && product.university_id && universities) {
                    const university = universities.find((u: any) => u.id === product.university_id);
                    if (university) {
                      return { lat: university.latitude, lng: university.longitude };
                    }
                  }
                  return defaultCenter;
                })()}
                zoom={15}
                onClick={isBuyer ? onMapClick : undefined}
                onLoad={onMapLoad}
              >
                {isBuyer && meetingLocation && (
                  <Marker
                    position={meetingLocation}
                    icon={{
                      url: '/marker.svg',
                      scaledSize: isLoaded ? new google.maps.Size(40, 40) : undefined,
                      anchor: isLoaded ? new google.maps.Point(20, 40) : undefined,
                    }}
                    animation={google.maps.Animation.DROP}
                  />
                )}
                {!isBuyer && pendingMeetup && (
                  <Marker
                    position={{ lat: pendingMeetup.latitude, lng: pendingMeetup.longitude }}
                    icon={{
                      url: '/marker.svg',
                      scaledSize: isLoaded ? new google.maps.Size(40, 40) : undefined,
                      anchor: isLoaded ? new google.maps.Point(20, 40) : undefined,
                    }}
                    animation={google.maps.Animation.DROP}
                  />
                )}
              </GoogleMap>
              {/* Buyer: Show coordinates and reset button */}
              {isBuyer && meetingLocation && (
                <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                  <Button variant="outline" onClick={handleResetLocation}>
                    Reset Location
                  </Button>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Latitude: {meetingLocation.lat.toFixed(6)}, Longitude: {meetingLocation.lng.toFixed(6)}
                    </p>
                    <p className="text-sm mt-1">
                      This location has been marked as the meeting point for the transaction.
                    </p>
                  </div>
                </div>
              )}
              {/* Seller: Show Accept/Reject if pending meetup exists */}
              {!isBuyer && pendingMeetup && !meetupAccepted && (
                <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                  <Button
                    variant="default"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/meetups/${pendingMeetup.id}/accept`, {
                          method: 'PUT',
                          credentials: 'include',
                        });
                        if (!res.ok) throw new Error('Failed to accept meetup');
                        setMeetupAccepted(true);
                        setPendingMeetup(null);
                        toast({ title: 'Meetup accepted', description: 'You have set up a meeting with the buyer for this product.' });
                      } catch (e: any) {
                        toast({ title: 'Error', description: e.message || 'Failed to accept meetup', variant: 'destructive' });
                      }
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/meetups/${pendingMeetup.id}/reject`, {
                          method: 'PUT',
                          credentials: 'include',
                        });
                        if (!res.ok) throw new Error('Failed to reject meetup');
                        setPendingMeetup(null);
                        toast({ title: 'Meetup rejected', description: 'You have rejected the meeting proposal.' });
                      } catch (e: any) {
                        toast({ title: 'Error', description: e.message || 'Failed to reject meetup', variant: 'destructive' });
                      }
                    }}
                  >
                    Reject
                  </Button>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Latitude: {pendingMeetup.latitude.toFixed(6)}, Longitude: {pendingMeetup.longitude.toFixed(6)}
                    </p>
                    <p className="text-sm mt-1">
                      This location has been proposed as a meeting point by the buyer.
                    </p>
                  </div>
                </div>
              )}
              {/* Seller: Show confirmation if accepted */}
              {!isBuyer && meetupAccepted && (
                <div className="absolute bottom-4 right-4 z-10">
                  <p className="text-green-600 font-semibold">You've set up a meeting with the seller for this product.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs>
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
            <li><span className="font-medium">University ID:</span> {product.university_id}</li>
            <li><span className="font-medium">Visibility:</span> {product.visibility}</li>
            <li><span className="font-medium">Stock:</span> {product.stock}</li>
            <li><span className="font-medium">Rating:</span> {product.avg_rating ? `${product.avg_rating} (${product.num_of_ratings} reviews)` : 'No ratings yet'}</li>
            <li><span className="font-medium">Posted Date:</span> {product.created_at ? formatDate(product.created_at) : 'N/A'}</li>
            {product.updated_at && product.updated_at !== product.created_at && (
              <li><span className="font-medium">Last Updated:</span> {formatDate(product.updated_at)}</li>
            )}
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
        {relatedProducts.length === 0 ? (
          <p className="text-muted-foreground">No related products found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map(relatedProduct => (
              <Card key={relatedProduct.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={relatedProduct.image && relatedProduct.image.length > 0 ? relatedProduct.image[0] : FALLBACK_IMAGE}
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
        )}
      </section>
    </div>
  );
}
