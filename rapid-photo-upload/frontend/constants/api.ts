/**
 * API configuration constants
 * Environment variables can be set during build time with EXPO_PUBLIC_ prefix
 */

// Production Elastic Beanstalk backend URL
const PRODUCTION_API_URL = 'https://teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com/api/v1';
const PRODUCTION_WS_URL = 'https://teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com';

// Development/local backend URL (used when running locally)
const DEVELOPMENT_API_URL = 'http://localhost:8080/api/v1';
const DEVELOPMENT_WS_URL = 'http://localhost:8080';

/**
 * Check if we're running in development mode
 */
const isDevelopment = (): boolean => {
    // Check for explicit environment variable first
    if (process.env.EXPO_PUBLIC_ENV === 'development') {
        return true;
    }
    if (process.env.EXPO_PUBLIC_ENV === 'production') {
        return false;
    }
    
    // __DEV__ is set by React Native/Expo in development mode
    if (typeof __DEV__ !== 'undefined') {
        return __DEV__ === true;
    }
    
    // Fallback to NODE_ENV check
    return process.env.NODE_ENV === 'development';
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

/**
 * Get the WebSocket URL
 * - Uses EXPO_PUBLIC_WS_URL if explicitly set (highest priority)
 * - Uses localhost in development mode
 * - Uses production URL in production builds
 */
export const getWebSocketUrl = (): string => {
    // Explicit environment variable override (highest priority)
    if (process.env.EXPO_PUBLIC_WS_URL) {
        return process.env.EXPO_PUBLIC_WS_URL;
    }

    // Use localhost in development mode
    if (isDevelopment()) {
        return DEVELOPMENT_WS_URL;
    }

    // Default to production URL for production builds
    return PRODUCTION_WS_URL;
};

// Export constants for direct use
export const API_URL = getApiUrl();
export const WS_URL = getWebSocketUrl();

