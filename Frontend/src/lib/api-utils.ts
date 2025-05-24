import { ApiResponse } from '@/types/api';
import { API_CONFIG } from '@/config/config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './utils';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  let data: any = {};

  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  }

  if (!response.ok) {
    return {
      success: false,
      error: {
        message: data?.message || data?.detail || 'An error occurred',
        statusCode: response.status,
        errors: data?.errors,
      },
    };
  }

  return {
    success: true,
    data: data as T,
  };
}

export async function fetchWithAuth<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401 && !url.includes(API_CONFIG.ENDPOINTS.AUTH.REFRESH)) {
    const refreshToken = getRefreshToken();
    
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const refreshResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refresh_token: refreshToken,
            }),
          });

          if (refreshResponse.ok) {
            const { access_token, refresh_token } = await refreshResponse.json();
            setTokens(access_token, refresh_token);
            processQueue(null, access_token);
            
            // Retry the original request with the new token
            headers.set('Authorization', `Bearer ${access_token}`);
            const retryResponse = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
              ...options,
              headers,
              credentials: 'include',
            });
            
            return handleApiResponse<T>(retryResponse);
          } else {
            // If refresh fails, clear auth and redirect to login
            clearTokens();
            processQueue(new Error('Session expired'));
            window.location.href = '/login';
            return {
              success: false,
              error: {
                message: 'Session expired. Please log in again.',
                statusCode: 401,
              },
            };
          }
        } catch (error) {
          processQueue(error);
          return {
            success: false,
            error: {
              message: 'Failed to refresh session',
              statusCode: 500,
            },
          };
        } finally {
          isRefreshing = false;
        }
      } else {
        // If we're already refreshing, queue the request
        return new Promise<ApiResponse<T>>((resolve) => {
          failedQueue.push({
            resolve: (token: string) => {
              // Retry the original request with the new token
              const retryHeaders = new Headers(headers);
              retryHeaders.set('Authorization', `Bearer ${token}`);
              
              fetch(`${API_CONFIG.BASE_URL}${url}`, {
                ...options,
                headers: retryHeaders,
                credentials: 'include',
              })
                .then(handleApiResponse<T>)
                .then(resolve);
            },
            reject: (error: any) => {
              resolve({
                success: false,
                error: {
                  message: error?.message || 'Request failed',
                  statusCode: 401,
                },
              });
            },
          });
        });
      }
    }
  }

  return handleApiResponse<T>(response);
}
