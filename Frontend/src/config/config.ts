// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      TOKEN: '/auth/token',
    },
    USERS: {
      PROFILE: '/users/me',
      UPDATE_PROFILE: '/users/me',
      CHANGE_PASSWORD: '/users/change-password',
    },
  },
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
  },
  DEFAULT_ERROR_MESSAGE: 'An unexpected error occurred. Please try again later.',
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  MARKETPLACE: '/marketplace',
  PRODUCT: '/marketplace/product',
  PROFILE: '/profile',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
} as const;

// Role-based access control
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Validation constants
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    MESSAGE:
      'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MESSAGE: 'Name must be between 2 and 50 characters',
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    REGEX: /^[a-zA-Z0-9_-]+$/,
    MESSAGE: 'Username must be between 3 and 30 characters and can only contain letters, numbers, underscores, and hyphens',
  },
} as const;
