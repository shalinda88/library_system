import { io, Socket } from 'socket.io-client';
import type { 
  Notification, 
  SocketMessage, 
  BookUpdateEvent 
} from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: SocketMessage) => void)[] = [];
  private notificationHandlers: ((notification: Notification) => void)[] = [];
  private bookUpdateHandlers: ((bookUpdate: BookUpdateEvent) => void)[] = [];
  private onlineStatusHandlers: ((userId: string, isOnline: boolean) => void)[] = [];

  // Initialize socket connection
  connect(token: string): void {
    // If socket exists and is connected, don't reconnect
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected, skipping reconnection');
      return;
    }
    
    // If socket exists but is disconnected, disconnect it first to clean up
    if (this.socket) {
      console.log('Disconnecting existing socket before reconnecting');
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('Connecting to socket server...');
    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  // Disconnect socket
  disconnect(): void {
    if (!this.socket) return;
    
    this.socket.disconnect();
    this.socket = null;
  }

  // Join a room (e.g., for librarian chat)
  joinRoom(room: string): void {
    if (!this.socket) return;
    
    this.socket.emit('join:room', room);
    console.log(`Joined room: ${room}`);
  }
  
  // Join a user-specific room for receiving notifications
  joinUserRoom(userId: string): void {
    if (!this.socket || !userId) return;
    
    this.socket.emit('join:room', userId);
    console.log(`Joined user room: ${userId}`);
  }

  // Send private message to another user
  sendPrivateMessage(to: string, message: string): void {
    if (!this.socket) return;
    
    this.socket.emit('message:private', { to, message });
  }

  // Send notification to specific users
  sendNotification(to: string | string[], notification: Notification): void {
    if (!this.socket) return;
    
    this.socket.emit('notification:send', { to, notification });
  }

  // Notify book update (e.g., availability change)
  notifyBookUpdate(bookData: BookUpdateEvent): void {
    if (!this.socket) return;
    
    this.socket.emit('book:update', bookData);
  }

  // Add message handler
  onMessage(callback: (message: SocketMessage) => void): () => void {
    this.messageHandlers.push(callback);
    
    return () => {
      this.messageHandlers = this.messageHandlers.filter(handler => handler !== callback);
    };
  }

  // Add notification handler
  onNotification(callback: (notification: Notification) => void): () => void {
    this.notificationHandlers.push(callback);
    
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter(handler => handler !== callback);
    };
  }

  // Add book update handler
  onBookUpdate(callback: (bookUpdate: BookUpdateEvent) => void): () => void {
    this.bookUpdateHandlers.push(callback);
    
    return () => {
      this.bookUpdateHandlers = this.bookUpdateHandlers.filter(handler => handler !== callback);
    };
  }

  // Add online status change handler
  onOnlineStatusChange(callback: (userId: string, isOnline: boolean) => void): () => void {
    this.onlineStatusHandlers.push(callback);
    
    return () => {
      this.onlineStatusHandlers = this.onlineStatusHandlers.filter(handler => handler !== callback);
    };
  }

  // Set up socket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('message:receive', (message: SocketMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('notification:receive', (notification: Notification) => {
      this.notificationHandlers.forEach(handler => handler(notification));
    });

    this.socket.on('book:updated', (bookUpdate: BookUpdateEvent) => {
      this.bookUpdateHandlers.forEach(handler => handler(bookUpdate));
    });

    this.socket.on('user:online', (userId: string) => {
      this.onlineStatusHandlers.forEach(handler => handler(userId, true));
    });

    this.socket.on('user:offline', (userId: string) => {
      this.onlineStatusHandlers.forEach(handler => handler(userId, false));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
  }
}

export default new SocketService();
