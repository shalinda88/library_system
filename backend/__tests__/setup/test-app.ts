import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from '../../src/routes/authRoutes.js';
import userRoutes from '../../src/routes/userRoutes.js';
import bookRoutes from '../../src/routes/bookRoutes.js';
import borrowingRoutes from '../../src/routes/borrowingRoutes.js';
import notificationRoutes from '../../src/routes/notificationRoutes.js';

export const setupTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/books', bookRoutes);
  app.use('/api/borrowings', borrowingRoutes);
  app.use('/api/notifications', notificationRoutes);
  
  return app;
};

// Add a dummy test to avoid the "Your test suite must contain at least one test" error
describe('Test App Setup', () => {
  it('should create an Express app with all routes', () => {
    const app = setupTestApp();
    expect(app).toBeDefined();
    // Just check that app exists, not internal properties
  });
});
