import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createSystemNotification,
  deleteNotification
} from '../controllers/notificationController.js';
import { auth, authorize } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

// Protected routes
router.get('/user/:userId', auth, getUserNotifications);
router.put('/:id/read', auth, markNotificationAsRead);
router.put('/user/:userId/read-all', auth, markAllNotificationsAsRead);
router.post('/', auth, authorize(UserRole.LIBRARIAN, UserRole.ADMIN), createSystemNotification);
router.delete('/:id', auth, deleteNotification);

export default router;
