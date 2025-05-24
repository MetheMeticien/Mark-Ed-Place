import { apiRequest } from './api-client';
import { API_CONFIG } from '@/config/config';

export interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  university_id: string;
  visibility: 'all' | 'university_only';
  image: string[];
  stock: number;
  avg_rating: number;
  num_of_ratings: number;
  seller_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  university_id: string;
  visibility: 'all' | 'university_only';
  image: string[];
  stock: number;
  avg_rating: number;
  num_of_ratings: number;
}

/**
 * API client for product-related endpoints
 */
export const productApi = {
  /**
   * Get all products
   */
  async getProducts() {
    return apiRequest<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS.ALL);
  },

  /**
   * Get a product by ID
   */
  async getProduct(id: string) {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.GET.replace(':id', id);
    return apiRequest<Product>(endpoint);
  },

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductRequest) {
    return apiRequest<Product>(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a product
   */
  async updateProduct(id: string, data: Partial<Product>) {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE.replace(':id', id);
    return apiRequest<Product>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string) {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.DELETE.replace(':id', id);
    return apiRequest(endpoint, {
      method: 'DELETE',
    });
  },
};
