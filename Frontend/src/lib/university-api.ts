import { ApiResponse } from '@/types/api';
import { apiRequest } from './api-client';

export interface University {
  id: string;
  name: string;
  country?: string;
  city?: string;
  logo?: string;
  created_at?: string;
  updated_at?: string | null;
}

/**
 * API client for university-related endpoints
 */
export const universityApi = {
  /**
   * Get all universities
   */
  async getAllUniversities(): Promise<ApiResponse<University[]>> {
    return apiRequest<University[]>('/universities/');
  },

  /**
   * Get a single university by ID
   */
  async getUniversity(id: string): Promise<ApiResponse<University>> {
    return apiRequest<University>(`/universities/${id}`);
  },

  /**
   * Get products from a specific university
   */
  async getUniversityProducts(universityId: string): Promise<ApiResponse<any[]>> {
    return apiRequest<any[]>(`/products/university/${universityId}`);
  }
};
