import { apiRequest } from './api-client';
import { API_CONFIG } from '@/config/config';
import { Product } from './product-api';

export interface Order {
  id: string;
  product_id: string;
  quantity: number;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string | null;
  product?: Product;
}

export interface CreateOrderRequest {
  product_id: string;
  quantity: number;
  seller_id: string;
}

/**
 * API client for order-related endpoints
 */
export const orderApi = {
  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderRequest) {
    return apiRequest<Order>('/orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all orders for the current user (purchases)
   */
  async getMyPurchases() {
    return apiRequest<Order[]>('/orders/me/purchases');
  },

  /**
   * Get all orders for products sold by the current user
   */
  async getMySales() {
    return apiRequest<Order[]>('/orders/me/sales');
  },

  /**
   * Get a specific order by ID
   */
  async getOrder(id: string) {
    return apiRequest<Order>(`/orders/${id}`);
  },

  /**
   * Update an order (only quantity can be updated)
   */
  async updateOrder(id: string, quantity: number) {
    return apiRequest<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  /**
   * Cancel an order
   */
  async cancelOrder(id: string) {
    return apiRequest(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
};
