import express from 'express';
import { 
  getBooks, 
  getBookById, 
  createBook, 
  updateBook, 
  deleteBook, 
  searchBooks 
} from '../controllers/bookController.js';
import { auth, authorize } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

// Librarian and Admin routes
router.post('/', auth, authorize(UserRole.LIBRARIAN, UserRole.ADMIN), createBook);
router.put('/:id', auth, authorize(UserRole.LIBRARIAN, UserRole.ADMIN), updateBook);
router.delete('/:id', auth, authorize(UserRole.LIBRARIAN, UserRole.ADMIN), deleteBook);

export default router;
