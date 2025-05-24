'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { ROUTES, ROLES } from '@/config/config';
import { userApi, productApi } from '@/lib/api-client';
import { toast } from '@/components/ui/use-toast';
import { Edit, Package, ShieldCheck, ShoppingCart, User as UserIcon } from 'lucide-react';
import { Product } from '@/types/api';

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper function to map product status
const getProductStatus = (product: Product) => {
  // This is a placeholder - in a real app, you'd have a status field or determine it based on other fields
  return product.stock > 0 ? 'active' : 'sold';
};

// Helper function to get product image
const getProductImage = (product: Product) => {
  return product.image || `https://placehold.co/300x200/e2e8f0/1e293b?text=${encodeURIComponent(product.title)}`;
};

const MOCK_LISTINGS = [
  {
    id: '101',
    title: 'Calculus Textbook',
    description: 'Used calculus textbook in good condition',
    price: 25.99,
    status: 'active',
    image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Calculus+Book',
    createdAt: '2025-05-01'
  },
  {
    id: '102',
    title: 'Scientific Calculator',
    description: 'Graphing calculator, barely used',
    price: 45.00,
    status: 'active',
    image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Calculator',
    createdAt: '2025-04-28'
  },
  {
    id: '103',
    title: 'Chemistry Lab Kit',
    description: 'Complete chemistry lab kit for beginners',
    price: 79.99,
    status: 'sold',
    image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Lab+Kit',
    createdAt: '2025-04-15'
  }
];

// Mock data for user orders
const MOCK_ORDERS = [
  {
    id: 'ord-001',
    items: [
      {
        id: '201',
        title: 'Physics Textbook',
        price: 32.50,
        quantity: 1,
        image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Physics+Book'
      }
    ],
    total: 32.50,
    status: 'delivered',
    date: '2025-05-10'
  },
  {
    id: 'ord-002',
    items: [
      {
        id: '202',
        title: 'Laptop Stand',
        price: 24.99,
        quantity: 1,
        image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Laptop+Stand'
      },
      {
        id: '203',
        title: 'Wireless Mouse',
        price: 19.99,
        quantity: 1,
        image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Mouse'
      }
    ],
    total: 44.98,
    status: 'processing',
    date: '2025-05-20'
  }
];

export default function ProfilePage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_no: user?.phone_no || '',
    username: user?.username || ''
  });
  const [moderatorRequestReason, setModeratorRequestReason] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement API call to update user profile
      // const response = await userApi.updateProfile(formData);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      
      // Update user context if needed
      // updateUser({ ...user, ...formData });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleModeratorRequest = async () => {
    if (!moderatorRequestReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for your request',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmittingRequest(true);
      const response = await userApi.requestModerator({ reason: moderatorRequestReason });

      console.log(response);
      
      if (response.success) {
        toast({
          title: 'Request Submitted',
          description: 'Your request to become a moderator has been submitted successfully.',
        });
        setModeratorRequestReason('');
      } 
      else{
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to submit request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Fetch user's products when component mounts and user is authenticated
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoadingProducts(true);
        setProductsError(null);
        
        const response = await productApi.getSellerProducts(user.id);
        
        if (response.success && response.data) {
          setUserProducts(response.data);
        } else {
          setProductsError(response.error?.message || 'Failed to fetch your listings');
        }
      } catch (error) {
        console.error('Error fetching user products:', error);
        setProductsError(error instanceof Error ? error.message : 'An error occurred while fetching your listings');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchUserProducts();
  }, [user?.id]);

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">My Profile</h1>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* User Profile Card */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <UserIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                
                {!isEditing ? (
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{user?.first_name} {user?.last_name}</h2>
                    <p className="text-sm text-muted-foreground">@{user?.username}</p>
                    <p className="mt-2 text-sm">{user?.email}</p>
                    {user?.phone_no && <p className="text-sm">{user?.phone_no}</p>}
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_no">Phone Number</Label>
                      <Input
                        id="phone_no"
                        name="phone_no"
                        value={formData.phone_no}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={handleSaveProfile}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Moderator Badge - Only visible for moderators */}
            {user?.role === ROLES.MODERATOR && (
              <CardContent className="border-t p-6">
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-800">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="font-medium">Moderator</span>
                  </div>
                </div>
              </CardContent>
            )}
            
            {/* Moderator Request Section - Only visible for normal users */}
            {user?.role === ROLES.USER && (
              <CardContent className="border-t p-6">
                <h3 className="mb-4 text-lg font-semibold">Request Moderator Role</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="moderator-reason">Why do you want to become a moderator?</Label>
                    <Textarea
                      id="moderator-reason"
                      placeholder="Explain why you would make a good moderator..."
                      value={moderatorRequestReason}
                      onChange={(e) => setModeratorRequestReason(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button 
                    onClick={handleModeratorRequest} 
                    disabled={isSubmittingRequest || !moderatorRequestReason.trim()}
                    className="w-full"
                  >
                    {isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
        
        {/* User Activity Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="listings">
            <TabsList className="w-full">
              <TabsTrigger value="listings" className="flex-1">
                <Package className="mr-2 h-4 w-4" />
                My Listings
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" />
                My Orders
              </TabsTrigger>
            </TabsList>
            {/* My Listings Tab */}
            <TabsContent value="listings" className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">My Listings</h3>
                <Button onClick={() => router.push(ROUTES.MARKETPLACE + '/sell')}>
                  Create New Listing
                </Button>
              </div>
              
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading your listings...</p>
                  </div>
                </div>
              ) : productsError ? (
                <div className="rounded-lg border border-destructive p-8 text-center">
                  <h4 className="text-lg font-medium text-destructive">Error Loading Listings</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{productsError}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setIsLoadingProducts(true);
                      setProductsError(null);
                      productApi.getSellerProducts(user?.id || '').then(response => {
                        if (response.success && response.data) {
                          setUserProducts(response.data);
                        } else {
                          setProductsError(response.error?.message || 'Failed to fetch your listings');
                        }
                        setIsLoadingProducts(false);
                      }).catch(error => {
                        setProductsError(error instanceof Error ? error.message : 'An error occurred');
                        setIsLoadingProducts(false);
                      });
                    }}
                  >
                    Try Again
                  </Button>
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
                        <div className="flex w-full gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => router.push(`${ROUTES.PRODUCT}/${product.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <h4 className="text-lg font-medium">No Listings Yet</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You haven't created any listings yet. Start selling your items!
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push(ROUTES.MARKETPLACE + '/sell')}
                  >
                    Create Your First Listing
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* My Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              <h3 className="mb-4 text-xl font-semibold">My Orders</h3>
              {/* Orders content */}
              {MOCK_ORDERS.length > 0 ? (
                <div className="space-y-4">
                  {MOCK_ORDERS.map(order => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                          </div>
                          <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 border-t pt-4 text-right">
                          <p className="font-medium">Total: ${order.total.toFixed(2)}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t p-4">
                        <Button variant="outline" size="sm" className="ml-auto">
                          View Order Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <h4 className="text-lg font-medium">No Orders Yet</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You haven't placed any orders yet.
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push(ROUTES.MARKETPLACE)}
                  >
                    Browse Marketplace
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
