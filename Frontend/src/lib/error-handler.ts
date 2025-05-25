import { ApiError } from '@/types/api';

export class ApiErrorHandler extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiError';
    this.statusCode = error.statusCode;
    this.errors = error.errors;
  }

  getFormattedErrors(): string {
    if (!this.errors) return this.message;
    
    return Object.entries(this.errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');
  }
}

export function handleApiError(error: unknown): { message: string; statusCode: number } {
  if (error instanceof ApiErrorHandler) {
    return {
      message: error.getFormattedErrors(),
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    console.error('API Error:', error);
    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
    };
  }

  return {
    message: 'An unknown error occurred',
    statusCode: 500,
  };
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiErrorHandler && error.statusCode === 401;
}

export function isApiError(error: unknown): error is ApiErrorHandler {
  return error instanceof ApiErrorHandler;
}
