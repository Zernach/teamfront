import { Platform } from 'react-native';

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
      return require('@react-native-async-storage/async-storage').default;
    } catch (error) {
      console.warn('AsyncStorage not available:', error);
      return null;
    }
  }

  private async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    const AsyncStorage = this.getAsyncStorage();
    if (!AsyncStorage) {
      throw new Error('AsyncStorage is not available on this platform');
    }
    return await AsyncStorage.getItem(key);
  }

  private async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
      return;
    }
    const AsyncStorage = this.getAsyncStorage();
    if (!AsyncStorage) {
      throw new Error('AsyncStorage is not available on this platform');
    }
    await AsyncStorage.setItem(key, value);
  }

  private async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
      return;
    }
    const AsyncStorage = this.getAsyncStorage();
    if (!AsyncStorage) {
      throw new Error('AsyncStorage is not available on this platform');
    }
    await AsyncStorage.removeItem(key);
  }

  async getAuthToken(): Promise<string | null> {
    return await this.getItem('auth_token');
  }

  async setAuthToken(token: string): Promise<void> {
    await this.setItem('auth_token', token);
  }

  async getUserData(): Promise<any | null> {
    const userData = await this.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  async setUserData(user: any): Promise<void> {
    await this.setItem('user_data', JSON.stringify(user));
  }

  async clearAuthToken(): Promise<void> {
    await this.removeItem('auth_token');
    await this.removeItem('user_data');
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
export default tokenStorage;

