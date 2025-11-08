import { io, Socket } from 'socket.io-client';

/**
 * WebSocket client for real-time upload progress updates.
 * Connects to backend WebSocket endpoint for upload progress events.
 */
class WebSocketClient {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(token?: string): void {
    if (this.socket?.connected) {
      return;
    }

    const url = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:8080';
    
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
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
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
      throw new Error('WebSocket not connected');
    }
    this.socket.on(`job:${jobId}:progress`, callback);
  }

  unsubscribeFromJobProgress(jobId: string): void {
    if (!this.socket) {
      return;
    }
    this.socket.off(`job:${jobId}:progress`);
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

