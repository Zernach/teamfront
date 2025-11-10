import { Platform } from 'react-native';

// Type declaration for window in web environment
declare global {
  interface Window {
    localStorage: Storage;
  }
}

/**
 * Storage utility for cross-platform token storage.
 * Uses localStorage on web, AsyncStorage on native.
 */
class TokenStorage {
  private getAsyncStorage() {
    if (Platform.OS === 'web') {
      return null;
    }
    // Lazy import AsyncStorage only on native platforms
    try {
      const AsyncStorageModule = require('@react-native-async-storage/async-storage');
      const AsyncStorage = AsyncStorageModule?.default || AsyncStorageModule;
      // Check if AsyncStorage is actually available (not null)
      if (!AsyncStorage) {
        console.warn('AsyncStorage module is null');
        return null;
      }
      return AsyncStorage;
    } catch (error) {
      console.warn('AsyncStorage not available:', error);
      return null;
    }
  }

  private async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        console.warn('localStorage.getItem failed:', error);
        return null;
      }
    }
    const AsyncStorage = this.getAsyncStorage();
    if (!AsyncStorage) {
      // Gracefully return null instead of throwing - prevents infinite loops
      console.warn('AsyncStorage not available, returning null for key:', key);
      return null;
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage.getItem failed:', error);
      return null;
    }
  }

  private async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (error) {
        console.warn('localStorage.setItem failed:', error);
        return;
      }
    }
    const AsyncStorage = this.getAsyncStorage();
    if (!AsyncStorage) {
      // Gracefully fail instead of throwing - prevents infinite loops
      console.warn('AsyncStorage not available, skipping setItem for key:', key);
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('AsyncStorage.setItem failed:', error);
    }
  }

  private async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (error) {
        console.warn('localStorage.removeItem failed:', error);
        return;
      }
    }
    const AsyncStorage = this.getAsyncStorage();
    if (!AsyncStorage) {
      // Gracefully fail instead of throwing - prevents infinite loops
      console.warn('AsyncStorage not available, skipping removeItem for key:', key);
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage.removeItem failed:', error);
    }
  }

  async getAuthToken(): Promise<string | null> {
    return await this.getItem('auth_token');
  }

  async setAuthToken(token: string): Promise<void> {
    await this.setItem('auth_token', token);
  }

  async clearAuthToken(): Promise<void> {
    await this.removeItem('auth_token');
  }

  async getRefreshToken(): Promise<string | null> {
    return await this.getItem('refresh_token');
  }

  async setRefreshToken(token: string): Promise<void> {
    await this.setItem('refresh_token', token);
  }

  async clearRefreshToken(): Promise<void> {
    await this.removeItem('refresh_token');
  }
}

export const tokenStorage = new TokenStorage();

