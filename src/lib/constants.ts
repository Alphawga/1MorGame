export const APP_NAME = 'Your App Name';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  ADMIN: '/api/admin',
} as const;

export const DEFAULT_PAGINATION = {
  LIMIT: 10,
  PAGE: 1,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to access this resource',
  FORBIDDEN: 'You do not have permission to access this resource',
  NOT_FOUND: 'Resource not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SERVER_ERROR: 'An unexpected error occurred',
} as const; 