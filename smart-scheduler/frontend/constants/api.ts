/**
 * API configuration constants
 * Environment variables can be set during build time with EXPO_PUBLIC_ prefix
 */

// Production Elastic Beanstalk backend URL
const PRODUCTION_API_URL = 'https://teamfront-smart-scheduler-archlife.us-west-1.elasticbeanstalk.com/api';

// Development/local backend URL (used when running locally)
const DEVELOPMENT_API_URL = 'http://localhost:5001/api';

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

    // If EXPO_PUBLIC_ENV is not set, check __DEV__ flag
    // __DEV__ is set by React Native/Expo in development mode
    if (typeof __DEV__ !== 'undefined') {
        return __DEV__ === true;
    }

    // Fallback to NODE_ENV check
    if (process.env.NODE_ENV === 'development') {
        return true;
    }

    // Final fallback: default to production for safety
    return false;
};

/**
 * Get the API base URL
 * - Uses EXPO_PUBLIC_API_URL if explicitly set (highest priority)
 * - Uses localhost in development mode
 * - Uses production URL in production builds
 */
export const getApiUrl = (): string => {
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

// Export constant for direct use
export const API_BASE_URL = getApiUrl();

// Log API configuration for debugging
if (__DEV__) {
    console.log('[API Config] Environment:', isDevelopment() ? 'Development' : 'Production');
    console.log('[API Config] API URL:', API_BASE_URL);
}

