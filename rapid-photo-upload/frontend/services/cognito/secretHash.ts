// services/cognito/secretHash.ts
// Utility to compute SECRET_HASH for Cognito authentication
// SECRET_HASH = Base64(HMAC_SHA256(client_secret, username + client_id))

import { Platform } from 'react-native';

/**
 * Computes SECRET_HASH for Cognito authentication
 * @param username - The username (email in our case)
 * @param clientId - The Cognito app client ID
 * @param clientSecret - The Cognito app client secret
 * @returns Base64-encoded HMAC-SHA256 hash
 */
export async function computeSecretHash(
  username: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  if (Platform.OS === 'web') {
    // Web implementation using Web Crypto API
    const encoder = new TextEncoder();
    const message = encoder.encode(username + clientId);
    const key = encoder.encode(clientSecret);
    
    // Import key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Compute HMAC
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
    
    // Convert to Base64
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  } else {
    // For native platforms, Amplify should handle SECRET_HASH automatically
    // If not, we'd need expo-crypto or react-native-quick-crypto
    // For now, throw an error to indicate this should be handled by Amplify
    throw new Error('SECRET_HASH computation on native platforms should be handled by Amplify. If this error occurs, Amplify configuration may be incorrect.');
  }
}

