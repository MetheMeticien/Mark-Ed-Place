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
  university_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  university_id: string;
  visibility: string;
  image: string | null;
  stock: number;
  avg_rating: number;
  num_of_ratings: number;
  seller_id: string;
  created_at: string;
  updated_at: string | null;
  university?: {
    name: string;
    email: string;
    id: string;
    created_at: string;
    updated_at: string | null;
  };
};


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
  university_id?: string;
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
