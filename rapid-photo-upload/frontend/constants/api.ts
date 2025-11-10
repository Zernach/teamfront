/**
 * API configuration constants
 * Environment variables can be set during build time with EXPO_PUBLIC_ prefix
 */

// Production Elastic Beanstalk backend URL
const PRODUCTION_API_URL = 'https://teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com/api/v1';
const PRODUCTION_WS_URL = 'https://teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com';

// Development/local backend URL (only used in development)
const DEVELOPMENT_API_URL = 'http://localhost:8080/api/v1';
const DEVELOPMENT_WS_URL = 'http://localhost:8080';

/**
 * Get the API base URL
 * Uses EXPO_PUBLIC_API_URL if set, otherwise defaults to production URL
 * In development, you can set EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
 */
export const getApiUrl = (): string => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // Default to production URL (not localhost) for deployed builds
    return PRODUCTION_API_URL;
};

/**
 * Get the WebSocket URL
 * Uses EXPO_PUBLIC_WS_URL if set, otherwise defaults to production URL
 * In development, you can set EXPO_PUBLIC_WS_URL=http://localhost:8080
 */
export const getWebSocketUrl = (): string => {
    if (process.env.EXPO_PUBLIC_WS_URL) {
        return process.env.EXPO_PUBLIC_WS_URL;
    }

    // Default to production URL (not localhost) for deployed builds
    return PRODUCTION_WS_URL;
};

// Export constants for direct use
export const API_URL = getApiUrl();
export const WS_URL = getWebSocketUrl();

