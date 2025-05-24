export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest extends LoginRequest {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Example API response types
declare global {
  interface Window {
    ENV: {
      API_URL: string;
    };
  }
}
