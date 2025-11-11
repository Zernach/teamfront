import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../constants/api';

/**
 * WebSocket client for real-time upload progress updates.
 * Connects to backend WebSocket endpoint for upload progress events.
 */
class WebSocketClient {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(token?: string): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected, skipping connection');
      return;
    }

    const url = WS_URL;
    console.log('[WebSocket] Connecting to:', url);
    console.log('[WebSocket] Has token:', !!token);

    this.socket = io(url, {
      path: '/ws/upload-progress',
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('[WebSocket] Connected successfully');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('[WebSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', {
        message: error.message,
        type: error.type,
        description: error.description,
      });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[WebSocket] Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[WebSocket] Reconnection attempt', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('[WebSocket] Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed after all attempts');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  subscribeToJobProgress(jobId: string, callback: (data: any) => void): void {
    if (!this.socket) {
      console.error('[WebSocket] Cannot subscribe to job progress: socket not initialized');
      throw new Error('WebSocket not connected');
    }
    if (!this.isConnected) {
      console.warn('[WebSocket] Socket exists but not connected, subscribing anyway');
    }
    const eventName = `job:${jobId}:progress`;
    console.log('[WebSocket] Subscribing to job progress:', eventName);
    this.socket.on(eventName, callback);
  }

  unsubscribeFromJobProgress(jobId: string): void {
    if (!this.socket) {
      console.warn('[WebSocket] Cannot unsubscribe: socket not initialized');
      return;
    }
    const eventName = `job:${jobId}:progress`;
    console.log('[WebSocket] Unsubscribing from job progress:', eventName);
    this.socket.off(eventName);
  }

  subscribeToPhotoProgress(photoId: string, callback: (data: any) => void): void {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }
    this.socket.on(`photo:${photoId}:progress`, callback);
  }

  unsubscribeFromPhotoProgress(photoId: string): void {
    if (!this.socket) {
      return;
    }
    this.socket.off(`photo:${photoId}:progress`);
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const webSocketClient = new WebSocketClient();
export default webSocketClient;

