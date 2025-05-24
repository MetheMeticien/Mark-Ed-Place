'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserCircle, Mail, Phone, GraduationCap, Calendar, Package, MessageCircle } from 'lucide-react';
import { User, Product } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/config/config';

interface UserWithUniversity extends User {
  university?: {
    id: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string | null;
  };
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper function to map product status
const getProductStatus = (product: Product) => {
  return product.stock > 0 ? 'active' : 'sold';
};

// Helper function to get product image
const getProductImage = (product: Product) => {
  return product.image || `https://placehold.co/300x200/e2e8f0/1e293b?text=${encodeURIComponent(product.title)}`;
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserWithUniversity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/auth/user/username/${params.username}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.username) {
      fetchUser();
    }
  }, [params.username]);

  // Fetch user products
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoadingProducts(true);
        setProductsError(null);
        
        const response = await fetch(`http://localhost:8000/products/seller/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user products');
        }
        
        const data = await response.json();
        setUserProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching user products:', error);
        setProductsError(error instanceof Error ? error.message : 'An error occurred while fetching listings');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchUserProducts();
  }, [user?.id]);

  const handleStartChat = async () => {
    if (!user) return;

    try {
      const response = await fetch('http://localhost:8000/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          name: `${user.first_name} ${user.last_name}`,
          is_group: false,
          participant_ids: [user.id]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create chat room');
      }

      const chatRoom = await response.json();
      router.push(`/chat?room=${chatRoom.id}`);
    } catch (error) {
      console.error('Error creating chat room:', error);
      // You might want to show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4" />
            <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center text-gray-500">
            <p>User not found</p>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Anonymous';
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Unknown';

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* User Profile Card */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                    {user.image ? (
                      <img 
                        src={user.image} 
                        alt={fullName} 
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{fullName}</h2>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    <p className="mt-2 text-sm">{user.email}</p>
                    {user.phone_no && <p className="text-sm">{user.phone_no}</p>}
                    <Button 
                      className="mt-4 w-full"
                      onClick={handleStartChat}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Start Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* User Listings */}
          <div className="md:col-span-2">
            <Tabs defaultValue="listings">
              <TabsList className="w-full">
                <TabsTrigger value="listings" className="flex-1">
                  <Package className="mr-2 h-4 w-4" />
                  Listings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="listings" className="mt-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">Listings</h3>
                </div>
                
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground">Loading listings...</p>
                    </div>
                  </div>
                ) : productsError ? (
                  <div className="rounded-lg border border-destructive p-8 text-center">
                    <h4 className="text-lg font-medium text-destructive">Error Loading Listings</h4>
                    <p className="mt-2 text-sm text-muted-foreground">{productsError}</p>
                  </div>
                ) : userProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {userProducts.map(product => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="relative aspect-video w-full overflow-hidden">
                          <img
                            src={getProductImage(product)}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                          <div className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${
                            getProductStatus(product) === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getProductStatus(product) === 'active' ? 'Active' : 'Sold'}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="text-lg font-semibold">{product.title}</h4>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-medium">${product.price.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">Listed on {formatDate(product.created_at)}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t p-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => router.push(`${ROUTES.PRODUCT}/${product.id}`)}
                          >
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <h4 className="text-lg font-medium">No Listings Yet</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This user hasn't created any listings yet.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 