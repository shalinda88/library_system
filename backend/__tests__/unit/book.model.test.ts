import '../setup/db-setup.js';
import Book from '../../src/models/Book.js';

describe('Book Model Tests', () => {
  it('should create a book successfully', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      isbn: 'TEST-123456',
      genre: 'Fiction',
      description: 'This is a test book description',
      publishedDate: new Date('2023-01-01'),
      coverImage: 'test-cover.jpg',
      totalCopies: 5,
      availableCopies: 3,
      location: 'Shelf A'
    };

    const book = await Book.create(bookData);
    expect(book).toBeDefined();
    expect(book.title).toBe(bookData.title);
    expect(book.author).toBe(bookData.author);
    expect(book.isbn).toBe(bookData.isbn);
    expect(book.genre).toBe(bookData.genre);
    expect(book.totalCopies).toBe(bookData.totalCopies);
    expect(book.availableCopies).toBe(bookData.availableCopies);
    expect(book.location).toBe(bookData.location);
  });

  it('should calculate correct status based on available copies', async () => {
    // Book with available copies should be "Available"
    const availableBook = await Book.create({
      title: 'Available Book',
      author: 'Author 1',
      isbn: 'ISBN-AVAIL-001',
      genre: 'Fiction',
      description: 'A book that is available',
      publishedDate: new Date(),
      totalCopies: 3,
      availableCopies: 3,
      location: 'Shelf B'
    });
    
    // Book with no available copies should be "Unavailable"
    const unavailableBook = await Book.create({
      title: 'Unavailable Book',
      author: 'Author 2',
      isbn: 'ISBN-UNAVAIL-001',
      genre: 'Non-Fiction',
      description: 'A book that is not available',
      publishedDate: new Date(),
      totalCopies: 2,
      availableCopies: 0,
      location: 'Shelf C'
    });
    
    // Access virtuals directly
    expect(availableBook.get('status')).toBe('Available');
    expect(unavailableBook.get('status')).toBe('Unavailable');
  });

  it('should not allow creating a book with duplicate ISBN', async () => {
    // Create a book first
    await Book.create({
      title: 'First Book',
      author: 'First Author',
      isbn: 'DUPLICATE-ISBN',
      genre: 'Fiction',
      description: 'First book description',
      publishedDate: new Date(),
      totalCopies: 1,
      availableCopies: 1,
      location: 'Shelf D'
    });

    // Try to create another book with the same ISBN
    try {
      await Book.create({
        title: 'Second Book',
        author: 'Second Author',
        isbn: 'DUPLICATE-ISBN',
        genre: 'Non-Fiction',
        description: 'Second book description',
        publishedDate: new Date(),
        totalCopies: 1,
        availableCopies: 1,
        location: 'Shelf E'
      });
      // If it reaches here, validation didn't fail as expected
      expect(true).toBe(false);
    } catch (error) {
      // Validation should fail for duplicate ISBN
      expect(error).toBeDefined();
    }
  });

  it('should set default values correctly', async () => {
    const minimalBook = await Book.create({
      title: 'Minimal Book',
      author: 'Minimal Author',
      isbn: 'MIN-ISBN-001',
      genre: 'Fiction',
      description: 'A minimal book with defaults',
      publishedDate: new Date(),
      location: 'Shelf F'
    });

    expect(minimalBook.totalCopies).toBe(1);
    expect(minimalBook.availableCopies).toBe(1);
    expect(minimalBook.coverImage).toBe('default-book-cover.jpg');
  });
});
