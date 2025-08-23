import { Request, Response } from 'express';
import Book, { IBook } from '../models/Book.js';
import { isValidObjectId, paginate } from '../utils/index.js';

// Get all books with pagination and filters
export const getBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page, 
      limit, 
      title, 
      author,
      genre,
      available,
      sort
    } = req.query;

    // Build query
    const query: Record<string, any> = {};

    if (title) {
      query.title = { $regex: title as string, $options: 'i' };
    }

    if (author) {
      query.author = { $regex: author as string, $options: 'i' };
    }

    if (genre) {
      query.genre = { $regex: genre as string, $options: 'i' };
    }

    if (available === 'true') {
      query.availableCopies = { $gt: 0 };
    } else if (available === 'false') {
      query.availableCopies = 0;
    }

    // Handle sorting
    const sortOption: Record<string, 1 | -1> = {};
    
    if (typeof sort === 'string') {
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortDirection = sort.startsWith('-') ? -1 : 1;
      sortOption[sortField] = sortDirection;
    } else {
      sortOption.title = 1; // default sort
    }

    // Execute query with pagination
    const result = await paginate<IBook>(
      Book,
      query,
      {
        page: Number(page),
        limit: Number(limit),
        sort: sortOption
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

// Get a single book by ID
export const getBookById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid book ID' });
      return;
    }
    
    const book = await Book.findById(id);
    
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a new book
export const createBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      title, 
      author, 
      isbn, 
      genre, 
      description, 
      publishedDate,
      coverImage,
      totalCopies,
      location
    } = req.body;
    
    // Check if book with ISBN already exists
    const bookExists = await Book.findOne({ isbn });
    
    if (bookExists) {
      res.status(400).json({ message: 'Book with this ISBN already exists' });
      return;
    }
    
    // Create new book
    const book = await Book.create({
      title,
      author,
      isbn,
      genre,
      description,
      publishedDate: new Date(publishedDate),
      coverImage: coverImage || 'default-book-cover.jpg',
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1,
      location
    });
    
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a book
export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid book ID' });
      return;
    }
    
    const book = await Book.findById(id);
    
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    const {
      title,
      author,
      genre,
      description,
      publishedDate,
      coverImage,
      totalCopies,
      availableCopies,
      location
    } = req.body;
    
    // Update fields
    if (title) book.title = title;
    if (author) book.author = author;
    if (genre) book.genre = genre;
    if (description) book.description = description;
    if (publishedDate) book.publishedDate = new Date(publishedDate);
    if (coverImage) book.coverImage = coverImage;
    
    // Handle copies logic
    if (totalCopies !== undefined) {
      const diff = totalCopies - book.totalCopies;
      book.totalCopies = totalCopies;
      
      // If total copies increased, increase available copies too
      if (diff > 0) {
        book.availableCopies += diff;
      } 
      // If total copies decreased, decrease available copies but not below 0
      else if (diff < 0 && Math.abs(diff) <= book.availableCopies) {
        book.availableCopies += diff;
      } else if (diff < 0) {
        book.availableCopies = 0;
      }
    }
    
    // Direct setting of available copies (use with caution)
    if (availableCopies !== undefined) {
      if (availableCopies > book.totalCopies) {
        res.status(400).json({ 
          message: 'Available copies cannot exceed total copies' 
        });
        return;
      }
      book.availableCopies = availableCopies;
    }
    
    if (location) book.location = location;
    
    // Save changes
    const updatedBook = await book.save();
    
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a book
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid book ID' });
      return;
    }
    
    const book = await Book.findById(id);
    
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    await Book.deleteOne({ _id: id });
    
    res.status(200).json({ message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Search books
export const searchBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }
    
    const result = await paginate<IBook>(
      Book,
      { $text: { $search: query } },
      {
        page: Number(page),
        limit: Number(limit),
        sort: { score: { $meta: 'textScore' } } as any
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
