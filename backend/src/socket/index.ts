import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User, { IUser } from '../models/User.js';

interface UserSocket {
  userId: string;
  socketId: string;
}

// Store connected users
const connectedUsers: UserSocket[] = [];

// Setup Socket.IO
const setupSocketIO = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: config.SOCKET_CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id);
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }
      
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Add user to connected users list
    if (socket.data.user) {
      const userId = socket.data.user._id.toString();
      connectedUsers.push({
        userId,
        socketId: socket.id
      });
      
      // Join a room with the user's ID for direct messaging
      socket.join(userId);
      
      console.log(`User ${userId} added to connected users and joined room ${userId}`);
      
      // Notify user connected
      socket.broadcast.emit('user:online', userId);
    }

    // Handle joining chat rooms
    socket.on('join:room', (room) => {
      socket.join(room);
      console.log(`User ${socket.data.user?._id} joined room: ${room}`);
    });
    
    // Handle private messages between users
    socket.on('message:private', ({ to, message }) => {
      const recipient = connectedUsers.find(user => user.userId === to);
      
      if (recipient) {
        io.to(recipient.socketId).emit('message:receive', {
          from: socket.data.user?._id,
          message
        });
      }
    });

    // Handle notifications
    socket.on('notification:send', ({ to, notification }) => {
      // If "to" is an array of user IDs
      if (Array.isArray(to)) {
        to.forEach(userId => {
          const recipientSockets = connectedUsers
            .filter(user => user.userId === userId)
            .map(user => user.socketId);
            
          recipientSockets.forEach(socketId => {
            io.to(socketId).emit('notification:receive', notification);
          });
        });
      } else {
        // If "to" is a single user ID
        const recipientSockets = connectedUsers
          .filter(user => user.userId === to)
          .map(user => user.socketId);
          
        recipientSockets.forEach(socketId => {
          io.to(socketId).emit('notification:receive', notification);
        });
      }
    });

    // Handle book updates (like availability changes)
    socket.on('book:update', (bookData) => {
      socket.broadcast.emit('book:updated', bookData);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Remove user from connected users list
      if (socket.data.user) {
        const userId = socket.data.user._id.toString();
        const index = connectedUsers.findIndex(
          user => user.socketId === socket.id
        );
        
        if (index !== -1) {
          connectedUsers.splice(index, 1);
          
          // Check if user has other active connections
          const hasOtherConnections = connectedUsers.some(
            user => user.userId === userId
          );
          
          if (!hasOtherConnections) {
            socket.broadcast.emit('user:offline', userId);
          }
        }
      }
    });
  });

  return io;
};

export default setupSocketIO;
