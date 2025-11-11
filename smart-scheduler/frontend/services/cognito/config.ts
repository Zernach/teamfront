// services/cognito/config.ts
import { Amplify } from 'aws-amplify';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Debug: Log what's available
if (__DEV__) {
  console.log('[Cognito Config] Platform:', Platform.OS);
  console.log('[Cognito Config] process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID:', process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID);
  console.log('[Cognito Config] Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
}

// Cognito configuration - read from app.json extra or environment variables
// Priority: process.env > Constants.expoConfig.extra (for web compatibility)
const COGNITO_USER_POOL_ID =
  process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_COGNITO_USER_POOL_ID ||
  '';

const COGNITO_CLIENT_ID =
  process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_COGNITO_CLIENT_ID ||
  '';

const COGNITO_REGION =
  process.env.EXPO_PUBLIC_COGNITO_REGION ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_COGNITO_REGION ||
  'us-west-1';

// Client secret - optional, only needed if app client is configured with a secret
// NOTE: For public clients (mobile/web apps), it's recommended to use an app client WITHOUT a secret
// If you must use a client secret, retrieve it from AWS Cognito Console > User Pool > App clients
const COGNITO_CLIENT_SECRET =
  process.env.EXPO_PUBLIC_COGNITO_CLIENT_SECRET ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_COGNITO_CLIENT_SECRET ||
  '';

// Validate configuration before setting up Amplify
if (!COGNITO_USER_POOL_ID || !COGNITO_CLIENT_ID) {
  const errorMsg = `Cognito configuration is missing. 
    UserPoolId: ${COGNITO_USER_POOL_ID || 'MISSING'}
    ClientId: ${COGNITO_CLIENT_ID || 'MISSING'}
    Platform: ${Platform.OS}
    Please set EXPO_PUBLIC_COGNITO_USER_POOL_ID and EXPO_PUBLIC_COGNITO_CLIENT_ID in app.json extra or environment variables`;

  console.error(errorMsg);
  throw new Error(errorMsg);
}

export const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: COGNITO_USER_POOL_ID,
      userPoolClientId: COGNITO_CLIENT_ID,
      ...(COGNITO_CLIENT_SECRET && { userPoolClientSecret: COGNITO_CLIENT_SECRET }),
      region: COGNITO_REGION,
      loginWith: {
        email: true,
        username: false,
      },
      userAttributes: {
        email: {
          required: true,
        },
      },
    },
  },
};

// Export config values for use in auth services
export const COGNITO_CONFIG = {
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID,
  clientSecret: COGNITO_CLIENT_SECRET,
  region: COGNITO_REGION,
};

// Configure Amplify only if we have valid configuration
Amplify.configure(cognitoConfig);
console.log('Amplify configured with Cognito:', {
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID.substring(0, 10) + '...', // Log partial client ID for security
  region: COGNITO_REGION,
  hasClientSecret: !!COGNITO_CLIENT_SECRET,
});

export default cognitoConfig;

