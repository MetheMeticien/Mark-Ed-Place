export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_no?: string;
  gender?: string;
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
  username: string;
  first_name: string;
  last_name: string;
  phone_no?: string;
  gender?: string;
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
