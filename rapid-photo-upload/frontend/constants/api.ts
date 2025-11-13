/**
 * API configuration constants
 * Environment variables can be set during build time with EXPO_PUBLIC_ prefix
 */

// Production Elastic Beanstalk backend URL - Using HTTPS with custom domain
const PRODUCTION_API_URL = 'https://api.teamfront-rapid-photo-upload.archlife.org/api/v1';
const PRODUCTION_WS_URL = 'https://api.teamfront-rapid-photo-upload.archlife.org';

// Development/local backend URL (used when running locally)
const DEVELOPMENT_API_URL = 'http://localhost:5000/api/v1';
const DEVELOPMENT_WS_URL = 'http://localhost:5000';

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

// Log API configuration for debugging
if (__DEV__) {
    console.log('[API Config] Environment:', isDevelopment() ? 'Development' : 'Production');
    console.log('[API Config] API URL:', API_URL);
    console.log('[API Config] WS URL:', WS_URL);
}

