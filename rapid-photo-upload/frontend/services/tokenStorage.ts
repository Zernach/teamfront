import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Storage utility for cross-platform token storage.
 * Uses localStorage on web, AsyncStorage on native.
 */
class TokenStorage {
  private async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  }

  private async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  }

  private async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
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
export default tokenStorage;

