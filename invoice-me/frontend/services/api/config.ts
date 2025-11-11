// services/api/config.ts

// Production Elastic Beanstalk backend URL
const PRODUCTION_API_URL = 'https://teamfront-invoice-me-archlife.us-west-1.elasticbeanstalk.com';

// Development/local backend URL (used when running locally)
const DEVELOPMENT_API_URL = 'http://localhost:5000';

/**
 * Check if we're running in development mode
 */
const isDevelopment = (): boolean => {
  // Check for explicit environment variable first (highest priority)
  if (process.env.EXPO_PUBLIC_ENV === 'production') {
    return false;
  }
  if (process.env.EXPO_PUBLIC_ENV === 'development') {
    return true;
  }

  // If EXPO_PUBLIC_ENV is not set, default to production for safety
  // This ensures production builds use production URLs by default
  if (process.env.EXPO_PUBLIC_ENV === undefined) {
    return false; // Default to production when env var is not set
  }

  // If EXPO_PUBLIC_ENV is set to something else, check __DEV__ as fallback
  // __DEV__ is set by React Native/Expo in development mode
  if (typeof __DEV__ !== 'undefined') {
    return __DEV__ === true;
  }

  // Final fallback to NODE_ENV check
  return process.env.NODE_ENV === 'development';
};

/**
 * Get the API base URL
 * - Uses EXPO_PUBLIC_API_URL if explicitly set (highest priority)
 * - Uses localhost in development mode
 * - Uses production URL in production builds
 */
const getApiUrl = (): string => {
  // Explicit environment variable override (highest priority)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Use localhost in development mode
  if (isDevelopment()) {
    return DEVELOPMENT_API_URL;
  }

  // Default to production URL for production builds
  return PRODUCTION_API_URL;
};

const API_BASE_URL = getApiUrl();

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiException extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiException';
  }
}



