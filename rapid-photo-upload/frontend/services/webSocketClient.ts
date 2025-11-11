import { WS_URL } from '../constants/api';

/**
 * Progress message format from backend
 */
interface ProgressMessage {
  type: 'photo_progress' | 'job_progress';
  photoId?: string | null;
  jobId?: string | null;
  current: number;
  total: number;
  status: string;
}

/**
 * WebSocket client for real-time upload progress updates.
 * Connects to backend WebSocket endpoint for upload progress events.
 * Uses native WebSocket API compatible with Spring WebSocket.
 */
class WebSocketClient {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private token: string | undefined;

  connect(token?: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected, skipping connection');
      return;
    }

    // Close existing connection if any
    if (this.socket) {
      this.disconnect();
    }

    this.token = token;
    // Convert HTTP/HTTPS URL to WebSocket URL
    const baseUrl = WS_URL.replace(/^https?:\/\//, (match) => {
      return match === 'https://' ? 'wss://' : 'ws://';
    });
    const url = `${baseUrl}/ws/progress${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    console.log('[WebSocket] Connecting to:', url);
    console.log('[WebSocket] Has token:', !!token);

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('[WebSocket] Connected successfully');
      };

      this.socket.onclose = (event) => {
        this.isConnected = false;
        console.log('[WebSocket] Disconnected:', event.code, event.reason);

        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
      };

      this.socket.onmessage = (event) => {
        try {
          const message: ProgressMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error, event.data);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`[WebSocket] Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log(`[WebSocket] Reconnection attempt ${this.reconnectAttempts}`);
      this.connect(this.token);
    }, delay);
  }

  private handleMessage(message: ProgressMessage): void {
    // Transform backend message format to match component expectations
    const transformedMessage = {
      photoId: message.photoId || undefined,
      jobId: message.jobId || undefined,
      progress: message.total > 0 ? Math.round((message.current / message.total) * 100) : 0,
      status: this.mapStatus(message.status),
      current: message.current,
      total: message.total,
    };

    // Route messages to appropriate handlers based on type and IDs
    if (message.type === 'job_progress' && message.jobId) {
      const eventName = `job:${message.jobId}:progress`;
      const handlers = this.messageHandlers.get(eventName);
      if (handlers) {
        handlers.forEach(callback => {
          try {
            callback(transformedMessage);
          } catch (error) {
            console.error('[WebSocket] Error in handler:', error);
          }
        });
      }
    }

    if (message.type === 'photo_progress' && message.photoId) {
      const eventName = `photo:${message.photoId}:progress`;
      const handlers = this.messageHandlers.get(eventName);
      if (handlers) {
        handlers.forEach(callback => {
          try {
            callback(transformedMessage);
          } catch (error) {
            console.error('[WebSocket] Error in handler:', error);
          }
        });
      }
    }
  }

  private mapStatus(status: string): 'completed' | 'failed' | 'uploading' {
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'COMPLETED' || upperStatus === 'DONE') {
      return 'completed';
    }
    if (upperStatus === 'FAILED' || upperStatus === 'ERROR') {
      return 'failed';
    }
    return 'uploading';
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      // Set code 1000 to indicate normal closure (prevents reconnection)
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
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

    if (!this.messageHandlers.has(eventName)) {
      this.messageHandlers.set(eventName, new Set());
    }
    this.messageHandlers.get(eventName)!.add(callback);
  }

  unsubscribeFromJobProgress(jobId: string): void {
    if (!this.socket) {
      console.warn('[WebSocket] Cannot unsubscribe: socket not initialized');
      return;
    }
    const eventName = `job:${jobId}:progress`;
    console.log('[WebSocket] Unsubscribing from job progress:', eventName);
    this.messageHandlers.delete(eventName);
  }

  subscribeToPhotoProgress(photoId: string, callback: (data: any) => void): void {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }
    const eventName = `photo:${photoId}:progress`;

    if (!this.messageHandlers.has(eventName)) {
      this.messageHandlers.set(eventName, new Set());
    }
    this.messageHandlers.get(eventName)!.add(callback);
  }

  unsubscribeFromPhotoProgress(photoId: string): void {
    if (!this.socket) {
      return;
    }
    const eventName = `photo:${photoId}:progress`;
    this.messageHandlers.delete(eventName);
  }

  getSocket(): WebSocket | null {
    return this.socket;
  }

  getIsConnected(): boolean {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Connect and wait for connection to be established.
   * Returns a promise that resolves when the socket is open.
   */
  async connectAndWait(token?: string, timeoutMs: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already connected, resolve immediately
      if (this.getIsConnected()) {
        console.log('[WebSocket] Already connected, resolving immediately');
        resolve();
        return;
      }

      // Set up timeout
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, timeoutMs);

      // Connect if not already connecting
      if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
        this.connect(token);
      }

      // Wait for connection
      const checkConnection = () => {
        if (this.getIsConnected()) {
          clearTimeout(timeout);
          resolve();
        } else if (this.socket?.readyState === WebSocket.CLOSED) {
          clearTimeout(timeout);
          reject(new Error('WebSocket connection failed'));
        } else {
          // Check again after a short delay
          setTimeout(checkConnection, 100);
        }
      };

      // Start checking
      checkConnection();
    });
  }
}

export const webSocketClient = new WebSocketClient();
export default webSocketClient;

