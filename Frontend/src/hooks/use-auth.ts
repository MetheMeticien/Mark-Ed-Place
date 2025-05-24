'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, userApi } from '@/lib/api-client';
import { User, ApiResponse, LoginRequest, SignupRequest } from '@/types/api';
import { storage } from '@/lib/storage';
import { ROUTES, ROLES } from '@/config/config';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
};

type AuthActions = {
  login: (credentials: LoginRequest) => Promise<ApiResponse<{ user: User }>>;
  signup: (data: SignupRequest) => Promise<ApiResponse<{ user: User }>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export function useAuth(): AuthState & AuthActions & { isAdmin: boolean } {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const isAdmin = useMemo(() => {
    return state.user?.role === ROLES.ADMIN;
  }, [state.user]);
  
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Check if user is authenticated on mount and on route change
  useEffect(() => {
    const token = storage.getItem('access_token');
    
    if (token) {
      checkAuth();
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  }, [pathname]);

  const checkAuth = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      
      const { data, error } = await authApi.getCurrentUser();
      
      if (error) throw new Error(error.message);

      console.log("From checkAuth: ", data);
      
      if (data) {
        // Map the API response to match our User interface
        // Type assertion to handle the API response structure
        const apiData = data as unknown as {
          id: string;
          username: string;
          email: string;
          first_name: string;
          last_name: string;
          phone_no?: string;
          gender?: string;
          role?: string;
          created_at?: string;
        };
        
        const userData: User = {
          id: apiData.id,
          username: apiData.username,
          email: apiData.email,
          first_name: apiData.first_name,
          last_name: apiData.last_name,
          phone_no: apiData.phone_no || '',
          gender: apiData.gender || '',
          role: apiData.role,
          createdAt: apiData.created_at
        };
        
        updateState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      updateState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Authentication check failed',
      });
      
      // Redirect to login if not already there and not a public route
      // Check if current path is a public route
      const path = pathname || '';
      const isPublicRoute = path === ROUTES.LOGIN || path === ROUTES.SIGNUP || path === ROUTES.HOME;
      if (!isPublicRoute) {
        router.push(ROUTES.LOGIN);
      }
    }
  }, [pathname, router, updateState]);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await authApi.login(credentials);

      console.log( "From useAuth: ", response);
      
      if (response.error || !response.data) {
        throw new Error(response.error?.message || 'Login failed');
      }
      

      updateState({
        user: response.data.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
      
      router.push(ROUTES.DASHBOARD);
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      updateState({
        isLoading: false,
        error: message,
      });
      return { success: false, error: { message, statusCode: 401 } };
    }
  }, [router, updateState]);

  const signup = useCallback(async (userData: SignupRequest) => {
    try {
      updateState({ isLoading: true, error: null });
      
      const signupData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        phone_no: userData.phone_no,
        gender: userData.gender,
      };
      
      const response = await authApi.signup(signupData);
      
      if (response.error || !response.data) {
        throw new Error(response.error?.message || 'Signup failed');
      }
      
      // Token handling is now managed in the API client
      updateState({
        user: response.data.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
      
      router.push(ROUTES.DASHBOARD);
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      updateState({
        isLoading: false,
        error: message,
      });
      return { success: false, error: { message, statusCode: 400 } };
    }
  }, [router, updateState]);

  const logout = useCallback(async () => {
    try {
      updateState({ isLoading: true });

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });

    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Redirect to login page
      router.push(ROUTES.LOGIN);
    }
  }, [router, updateState]);

  // Initialize authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
  }, [checkAuth]);

  return {
    ...state,
    isAdmin,
    login,
    signup,
    logout,
    refreshUser: checkAuth,
  };
}

export default useAuth;
