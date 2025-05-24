import { ApiResponse, User } from '@/types/api';
import { API_CONFIG } from '@/config/config';
import { fetchWithAuth } from './api-utils';
import { storage } from './storage';

/**
 * Make an API request with authentication handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    return await fetchWithAuth<T>(endpoint, options);
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: {
        message: 'Network error. Please check your connection and try again.',
        statusCode: 500,
      },
    };
  }
}

/**
 * API client for authentication endpoints
 */
export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: { email: string; password: string }) {
    const response = await apiRequest<{ 
      user: User; 
      access_token: string; 
      refresh_token?: string 
    }>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data) {
      storage.setItem('access_token', response.data.access_token);
      if (response.data.refresh_token) {
        storage.setItem('refresh_token', response.data.refresh_token);
      }
    }
    
    return response;
  },

  /**
   * Register a new user
   */
  async signup(userData: { 
    first_name: string; 
    last_name: string; 
    username: string; 
    email: string; 
    password: string; 
    phone_no?: string; 
    gender?: string; 
  }) {
    const response = await apiRequest<{ 
      user: User; 
      access_token: string; 
      refresh_token?: string 
    }>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data) {
      storage.setItem('access_token', response.data.access_token);
      if (response.data.refresh_token) {
        storage.setItem('refresh_token', response.data.refresh_token);
      }
    }
    
    return response;
  },

  /**
   * Logout the current user
   */
  async logout() {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, { 
        method: 'POST' 
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storage.removeItem('access_token');
      storage.removeItem('refresh_token');
    }
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser() {
    return apiRequest<{ user: User }>(API_CONFIG.ENDPOINTS.AUTH.ME);
  },
  
  /**
   * Refresh the access token using a refresh token
   */
  async refreshToken(refreshToken: string) {
    return apiRequest<{ 
      access_token: string; 
      refresh_token?: string 
    }>(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
};

/**
 * API client for user-related endpoints
 */
export const userApi = {
  /**
   * Get the current user's profile
   */
  async getProfile() {
    return apiRequest<{ user: User }>(API_CONFIG.ENDPOINTS.USERS.PROFILE);
  },

  /**
   * Update the current user's profile
   */
  async updateProfile(data: { name?: string; email?: string; image?: string }) {
    return apiRequest<{ user: User }>(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change the current user's password
   */
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return apiRequest(API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
