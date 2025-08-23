import express from 'express';
import http from 'http';
import cors from 'cors';
import connectDB from './src/config/db.js';
import config from './src/config/index.js';
import setupSocketIO from './src/socket/index.js';
import { errorHandler } from './src/middleware/auth.js';

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import bookRoutes from './src/routes/bookRoutes.js';
import borrowingRoutes from './src/routes/borrowingRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Health check endpoints
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Test query params endpoint
app.get('/test-query', (req, res) => {
  console.log('Test query string:', req.url);
  console.log('Test query params:', req.query);
  res.status(200).json({ 
    receivedParams: req.query,
    message: 'Query parameters received successfully'
  });
});

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = setupSocketIO(server);

// Make Socket.IO available in Express
app.set('io', io);

// Start server
const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
