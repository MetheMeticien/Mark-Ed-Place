'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Product } from '@/lib/product-api';
import { toast } from '@/components/ui/use-toast';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mark-ed-place-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);
  
  const addItem = (product: Product, quantity: number) => {
    // Check if product is in stock
    if (product.stock <= 0) {
      toast({
        title: 'Out of stock',
        description: `${product.title} is currently out of stock`,
        variant: 'destructive',
      });
      return false;
    }
    
    setItems(prevItems => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Check if adding more would exceed available stock
        const newQuantity = prevItems[existingItemIndex].quantity + quantity;
        
        if (newQuantity > product.stock) {
          toast({
            title: 'Limited stock',
            description: `Only ${product.stock} items available. You already have ${prevItems[existingItemIndex].quantity} in your cart.`,
            variant: 'destructive',
          });
          return prevItems;
        }
        
        // Update quantity if product already exists and stock is sufficient
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity = newQuantity;
        
        toast({
          title: 'Cart updated',
          description: `${product.title} quantity updated to ${newQuantity}`,
        });
        
        return updatedItems;
      } else {
        // Add new item if product doesn't exist in cart
        toast({
          title: 'Added to cart',
          description: `${quantity} × ${product.title} added to your cart`,
        });
        
        return [...prevItems, { product, quantity }];
      }
    });
    
    return true;
  };
  
  const removeItem = (productId: string) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.product.id === productId);
      if (itemToRemove) {
        toast({
          title: 'Removed from cart',
          description: `${itemToRemove.product.title} removed from your cart`,
        });
      }
      return prevItems.filter(item => item.product.id !== productId);
    });
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart',
    });
  };
  
  // Calculate total items and price
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  
  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
