import { Request, Response } from 'express';
import Borrowing, { BorrowingStatus, IBorrowing } from '../models/Borrowing.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Notification, { NotificationType } from '../models/Notification.js';
import { isValidObjectId, calculateDueDate, calculateFine, paginate } from '../utils/index.js';

// Borrow a book
export const borrowBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId, userId, dueDate } = req.body;
    
    // Validate IDs
    if (!isValidObjectId(bookId) || !isValidObjectId(userId)) {
      res.status(400).json({ message: 'Invalid book or user ID' });
      return;
    }
    
    // Get book and user
    const book = await Book.findById(bookId);
    const user = await User.findById(userId);
    
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Check if book is available
    if (book.availableCopies <= 0) {
      res.status(400).json({ message: 'Book is not available for borrowing' });
      return;
    }
    
    // Check if user can borrow more books
    if (user.borrowedBooks >= user.borrowingLimit) {
      res.status(400).json({ 
        message: 'User has reached their borrowing limit' 
      });
      return;
    }
    
    // Calculate due date if not provided
    const calculatedDueDate = dueDate ? new Date(dueDate) : calculateDueDate();
    
    // Create borrowing record
    const borrowing = await Borrowing.create({
      userId: user._id,
      bookId: book._id,
      borrowDate: new Date(),
      dueDate: calculatedDueDate,
      status: BorrowingStatus.BORROWED
    });
    
    // Update book and user
    book.availableCopies -= 1;
    user.borrowedBooks += 1;
    
    await Promise.all([book.save(), user.save()]);
    
    // Create a notification for the user
    const notification = await Notification.create({
      userId: user._id,
      type: NotificationType.DUE_DATE_REMINDER,
      message: `You have borrowed "${book.title}". It is due back by ${calculatedDueDate.toLocaleDateString()}.`,
      relatedBookId: book._id,
      relatedBorrowingId: borrowing._id
    });
    
    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      // Emit to the specific user's room
      io.to(user.id.toString()).emit('notification:receive', notification);
    }
    
    res.status(201).json({
      message: 'Book borrowed successfully',
      borrowing
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Return a book
export const returnBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { condition } = req.body;
    
    // Validate ID
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid borrowing ID' });
      return;
    }
    
    // Find borrowing record
    const borrowing = await Borrowing.findById(id);
    
    if (!borrowing) {
      res.status(404).json({ message: 'Borrowing record not found' });
      return;
    }
    
    // Check if already returned
    if (borrowing.status === BorrowingStatus.RETURNED) {
      res.status(400).json({ message: 'Book has already been returned' });
      return;
    }
    
    // Get book and user
    const book = await Book.findById(borrowing.bookId);
    const user = await User.findById(borrowing.userId);
    
    if (!book || !user) {
      res.status(404).json({ message: 'Associated book or user not found' });
      return;
    }
    
    // Set return date and calculate fine if overdue
    const returnDate = new Date();
    borrowing.returnDate = returnDate;
    
    // Calculate fine if overdue
    if (returnDate > borrowing.dueDate) {
      borrowing.fine = calculateFine(borrowing.dueDate, returnDate);
      borrowing.status = BorrowingStatus.OVERDUE;
    } else {
      borrowing.status = BorrowingStatus.RETURNED;
    }
    
    if (condition) {
      borrowing.notes = `Return condition: ${condition}`;
    }
    
    // Update book and user
    book.availableCopies += 1;
    user.borrowedBooks -= 1;
    
    await Promise.all([borrowing.save(), book.save(), user.save()]);
    
    // Create a notification for the user
    const notification = await Notification.create({
      userId: user._id,
      type: NotificationType.RETURN_CONFIRMATION,
      message: `You have returned "${book.title}". ${borrowing.fine ? `A fine of $${borrowing.fine} has been applied.` : 'Thank you for returning it on time.'}`,
      relatedBookId: book._id,
      relatedBorrowingId: borrowing._id
    });
    
    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      // Emit to the specific user's room
      io.to(user.id.toString()).emit('notification:receive', notification);
    }
    
    res.status(200).json({
      message: 'Book returned successfully',
      borrowing
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all borrowings with filters
export const getBorrowings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log the raw query parameters first
    console.log('Raw query string:', req.url);
    console.log('Raw query object:', req.query);
    console.log('Original params:', req.originalUrl);
    
    // Clone the query object to work with it
    const queryParams = { ...req.query };
    const { 
      page = '1', 
      limit = '10', 
      userId, 
      bookId, 
      status,
      overdue = 'false'
    } = queryParams;
    
    console.log('Parsed Query Parameters:', { 
      page: typeof page, 
      pageValue: page, 
      limit: typeof limit, 
      limitValue: limit, 
      userId, 
      bookId, 
      status, 
      overdue 
    });
    
    // Parse pagination values to ensure they're numbers
    const parsedPage = parseInt(page as string, 10) || 1;
    const parsedLimit = parseInt(limit as string, 10) || 10;
    
    console.log('Parsed pagination values:', { parsedPage, parsedLimit });
    
    // Build query
    const query: Record<string, any> = {};
    
    if (userId && isValidObjectId(userId as string)) {
      query.userId = userId;
    }
    
    if (bookId && isValidObjectId(bookId as string)) {
      query.bookId = bookId;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Check for overdue books
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = BorrowingStatus.BORROWED;
    }
    
    console.log('MongoDB Query:', JSON.stringify(query));
    
    const result = await paginate<IBorrowing>(
      Borrowing,
      query,
      {
        page: parsedPage,
        limit: parsedLimit,
        sort: { borrowDate: -1 },
        populate: ['userId', 'bookId']
      }
    );
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a single borrowing record
export const getBorrowingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid borrowing ID' });
      return;
    }
    
    const borrowing = await Borrowing.findById(id)
      .populate('userId', 'name email membershipId')
      .populate('bookId', 'title author isbn');
    
    if (!borrowing) {
      res.status(404).json({ message: 'Borrowing record not found' });
      return;
    }
    
    res.status(200).json(borrowing);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get borrowing history for a user
export const getUserBorrowingHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Validate ID
    if (!isValidObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    const result = await paginate<IBorrowing>(
      Borrowing,
      { userId },
      {
        page: Number(page),
        limit: Number(limit),
        sort: { borrowDate: -1 },
        populate: 'bookId'
      }
    );
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
