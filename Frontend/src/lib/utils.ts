import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ApiError = {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
};

type ApiResponse<T> = {
  data?: T;
  error?: ApiError;
  success: boolean;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const isClient = typeof window !== 'undefined';

export const getAccessToken = (): string | null => {
  if (!isClient) return null;
  return localStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  if (!isClient) return null;
  return localStorage.getItem('refresh_token');
};

export const setTokens = (accessToken: string, refreshToken?: string): void => {
  if (!isClient) return;
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
};

export const clearTokens = (): void => {
  if (!isClient) return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const handleApiError = (error: unknown): { message: string; statusCode: number } => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as { message?: string; statusCode?: number; errors?: Record<string, string[]> };
    return {
      message: apiError.message || 'An unexpected error occurred',
      statusCode: apiError.statusCode || 500,
    };
  }
  return {
    message: 'An unknown error occurred',
    statusCode: 500,
  };
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error
  );
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
