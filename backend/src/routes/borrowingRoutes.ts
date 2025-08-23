import express from 'express';
import {
  borrowBook,
  returnBook,
  getBorrowings,
  getBorrowingById,
  getUserBorrowingHistory
} from '../controllers/borrowingController.js';
import { auth, authorize } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

// Protected routes
router.post('/', auth, authorize(UserRole.LIBRARIAN, UserRole.ADMIN), borrowBook);
router.put('/:id/return', auth, authorize(UserRole.LIBRARIAN, UserRole.ADMIN), returnBook);
router.get('/', auth, authorize(UserRole.LIBRARIAN, UserRole.ADMIN), getBorrowings);
router.get('/:id', auth, getBorrowingById);
router.get('/user/:userId', auth, getUserBorrowingHistory);

export default router;
