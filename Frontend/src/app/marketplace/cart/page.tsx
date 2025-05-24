'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react';
import { ROUTES } from '@/config/config';
import { useCart } from '@/components/providers/cart-provider';
import { toast } from '@/components/ui/use-toast';

// Fallback image for products without images
const FALLBACK_IMAGE = 'https://placehold.co/300x200/e2e8f0/1e293b?text=No+Image';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, checkout, isCheckingOut, totalItems, totalPrice } = useCart();

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity, 10);
    if (!isNaN(quantity) && quantity > 0) {
      // Find the item to get its stock
      const item = items.find(item => item.product.id === productId);
      if (item) {
        // Check if requested quantity exceeds stock
        if (quantity > item.product.stock) {
          toast({
            title: 'Limited stock',
            description: `Only ${item.product.stock} items available.`,
            variant: 'destructive',
          });
          // Update to maximum available stock instead
          updateQuantity(productId, item.product.stock);
        } else {
          updateQuantity(productId, quantity);
        }
      }
    }
  };

  const handleCheckout = async () => {
    const success = await checkout();
    if (success) {
      router.push(ROUTES.MARKETPLACE);
    }
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
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button
            className="mt-6"
            onClick={() => router.push(ROUTES.MARKETPLACE)}
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.product.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="aspect-square h-32 w-32 shrink-0 overflow-hidden sm:h-40 sm:w-40">
                        <img
                          src={item.product.image && item.product.image.length > 0 
                            ? item.product.image[0] 
                            : FALLBACK_IMAGE}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <Link 
                            href={`${ROUTES.PRODUCT}/${item.product.id}`}
                            className="font-semibold hover:underline"
                          >
                            {item.product.title}
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.product.description.length > 100
                              ? `${item.product.description.substring(0, 100)}...`
                              : item.product.description}
                          </p>
                          <div className="mt-2 flex items-center text-sm">
                            <span className="font-medium">Condition:</span>
                            <span className="ml-2 text-muted-foreground">
                              {item.product.condition}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2 font-medium">Quantity:</span>
                            <Input
                              type="number"
                              min="1"
                              max={item.product.stock}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.product.id || '',
                                  e.target.value
                                )
                              }
                              className="w-16"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.product.id || '')}
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.push(ROUTES.MARKETPLACE)}
              >
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">Order Summary</h2>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <span>Items ({totalItems})</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="mt-6 w-full"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? 'Processing...' : 'Checkout'}
                </Button>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  By checking out, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
