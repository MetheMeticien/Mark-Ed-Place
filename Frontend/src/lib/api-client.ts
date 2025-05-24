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
    // First get the user data from login endpoint
    const userResponse = await apiRequest<{ user: User }>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log(userResponse);
    
    if (userResponse.error || !userResponse.data) {
      return userResponse as ApiResponse<{ user: User; access_token: string; refresh_token?: string }>;
    }
    
    // Then get the token using the token endpoint with username as the email
    // This matches the backend's OAuth2PasswordRequestForm expectation
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    const tokenResponse = await apiRequest<{ 
      access_token: string; 
      token_type: string;
      refresh_token?: string 
    }>(API_CONFIG.ENDPOINTS.AUTH.TOKEN, {
      method: 'POST',
      body: formData,
    });

    console.log(tokenResponse);
    
    if (tokenResponse.error || !tokenResponse.data) {
      return { 
        success: false, 
        error: tokenResponse.error || { message: 'Failed to get token', statusCode: 401 }
      };
    }
    
    // Store tokens
    storage.setItem('access_token', tokenResponse.data.access_token);
    if (tokenResponse.data.refresh_token) {
      storage.setItem('refresh_token', tokenResponse.data.refresh_token);
    }
    
    // Return combined response
    return {
      success: true,
      data: {
        user: userResponse.data.user,
        access_token: tokenResponse.data.access_token,
        refresh_token: tokenResponse.data.refresh_token
      }
    };
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
    university_id?: string;
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
    return apiRequest<User>(API_CONFIG.ENDPOINTS.AUTH.ME);
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

  /**
   * Request to become a moderator
   */
  async requestModerator(data: { reason: string }) {
    return apiRequest('/moderator-requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * API client for product-related endpoints
 */
export const productApi = {
  /**
   * Get all products
   */
  async getAllProducts() {
    return apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS.ALL);
  },

  /**
   * Get a single product by ID
   */
  async getProduct(id: string) {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.GET.replace(':id', id);
    return apiRequest(endpoint);
  },

  /**
   * Get products by seller ID
   */
  async getSellerProducts(sellerId: string) {
    return apiRequest(`/products/seller/${sellerId}`);
  },

  /**
   * Create a new product
   */
  async createProduct(productData: any) {
    return apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  /**
   * Update a product
   */
  async updateProduct(id: string, productData: any) {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE.replace(':id', id);
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(productData),
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
