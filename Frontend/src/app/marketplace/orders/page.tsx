'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, ShoppingBag } from 'lucide-react';
import { ROUTES } from '@/config/config';
import { orderApi, Order } from '@/lib/order-api';
import { toast } from '@/components/ui/use-toast';

// Fallback image for products without images
const FALLBACK_IMAGE = 'https://placehold.co/300x200/e2e8f0/1e293b?text=No+Image';

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('purchases');
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Fetch purchases
        const purchasesResponse = await orderApi.getMyPurchases();
        if (purchasesResponse.success && purchasesResponse.data) {
          setPurchases(purchasesResponse.data);
        } else {
          toast({
            title: 'Error',
            description: purchasesResponse.error?.message || 'Failed to load purchases',
            variant: 'destructive',
          });
        }

        // Fetch sales
        const salesResponse = await orderApi.getMySales();
        if (salesResponse.success && salesResponse.data) {
          setSales(salesResponse.data);
        } else {
          toast({
            title: 'Error',
            description: salesResponse.error?.message || 'Failed to load sales',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load orders. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await orderApi.cancelOrder(orderId);
      if (response.success) {
        toast({
          title: 'Order cancelled',
          description: 'Your order has been cancelled successfully.',
        });
        // Update the purchases list
        setPurchases(purchases.filter(order => order.id !== orderId));
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to cancel order',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      <Tabs
        defaultValue="purchases"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchases" className="flex items-center">
            <ShoppingBag className="mr-2 h-4 w-4" />
            My Purchases
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            My Sales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading your purchases...</p>
              </div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">No purchases yet</h2>
              <p className="mt-2 text-muted-foreground">
                You haven't made any purchases yet.
              </p>
              <Button
                className="mt-6"
                onClick={() => router.push(ROUTES.MARKETPLACE)}
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {purchases.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="aspect-square h-24 w-24 shrink-0 overflow-hidden">
                        <img
                          src={order.product?.image && order.product.image.length > 0 
                            ? order.product.image[0] 
                            : FALLBACK_IMAGE}
                          alt={order.product?.title || 'Product image'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          <Link 
                            href={`${ROUTES.PRODUCT}/${order.product_id}`}
                            className="hover:underline"
                          >
                            {order.product?.title || 'Product'}
                          </Link>
                        </h3>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Quantity:</span>{' '}
                            <span className="text-muted-foreground">{order.quantity}</span>
                          </div>
                          <div>
                            <span className="font-medium">Price:</span>{' '}
                            <span className="text-muted-foreground">
                              ${order.product?.price ? (order.product.price * order.quantity).toFixed(2) : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Cancel Order
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading your sales...</p>
              </div>
            </div>
          ) : sales.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <Package className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">No sales yet</h2>
              <p className="mt-2 text-muted-foreground">
                You haven't sold any products yet.
              </p>
              <Button
                className="mt-6"
                onClick={() => router.push(ROUTES.MARKETPLACE)}
              >
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {sales.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="aspect-square h-24 w-24 shrink-0 overflow-hidden">
                        <img
                          src={order.product?.image && order.product.image.length > 0 
                            ? order.product.image[0] 
                            : FALLBACK_IMAGE}
                          alt={order.product?.title || 'Product image'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          <Link 
                            href={`${ROUTES.PRODUCT}/${order.product_id}`}
                            className="hover:underline"
                          >
                            {order.product?.title || 'Product'}
                          </Link>
                        </h3>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Quantity:</span>{' '}
                            <span className="text-muted-foreground">{order.quantity}</span>
                          </div>
                          <div>
                            <span className="font-medium">Price:</span>{' '}
                            <span className="text-muted-foreground">
                              ${order.product?.price ? (order.product.price * order.quantity).toFixed(2) : 'N/A'}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Buyer ID:</span>{' '}
                            <span className="text-muted-foreground">{order.buyer_id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
