import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { auth, authorize } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

// Admin routes
router.get('/', auth, authorize(UserRole.ADMIN, UserRole.LIBRARIAN), getUsers);
router.get('/:id', auth, getUserById);
router.post('/', auth, authorize(UserRole.ADMIN), createUser);
router.put('/:id', auth, authorize(UserRole.ADMIN), updateUser);
router.delete('/:id', auth, authorize(UserRole.ADMIN), deleteUser);

export default router;
