import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './dist/src/models/User.js';
import Book from './dist/src/models/Book.js';
import Borrowing from './dist/src/models/Borrowing.js';

dotenv.config();

// Sample users data
const users = [
  {
    name: "Admin User",
    email: "admin@library.com",
    password: "$2a$12$Sk.PiU49ED9YtEo3J8SuUOVt3VNHHicCNeX79T5x.1vMlzPwSNoVS", // password123
    role: "admin",
    membershipId: "ADM001",
    borrowingLimit: 10,
    borrowedBooks: 0,
    isActive: true
  },
  {
    name: "Librarian User",
    email: "librarian@library.com",
    password: "$2a$12$Sk.PiU49ED9YtEo3J8SuUOVt3VNHHicCNeX79T5x.1vMlzPwSNoVS", // password123
    role: "librarian",
    membershipId: "LIB001",
    borrowingLimit: 10,
    borrowedBooks: 1,
    isActive: true
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "$2a$12$Sk.PiU49ED9YtEo3J8SuUOVt3VNHHicCNeX79T5x.1vMlzPwSNoVS", // password123
    role: "user",
    membershipId: "USR001",
    borrowingLimit: 5,
    borrowedBooks: 2,
    isActive: true
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "$2a$12$Sk.PiU49ED9YtEo3J8SuUOVt3VNHHicCNeX79T5x.1vMlzPwSNoVS", // password123
    role: "user",
    membershipId: "USR002",
    borrowingLimit: 5,
    borrowedBooks: 1,
    isActive: true
  }
];

// Sample books data
const books = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    genre: "Fiction, Classic",
    description: "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan. Set in the Jazz Age of the 1920s, Fitzgerald's third book stands as the supreme achievement of his career.",
    publishedDate: new Date("2004-09-30"),
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg",
    totalCopies: 5,
    availableCopies: 3,
    location: "Fiction Section - Shelf A"
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    genre: "Fiction, Classic, Historical",
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.",
    publishedDate: new Date("2006-05-23"),
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
    totalCopies: 4,
    availableCopies: 2,
    location: "Fiction Section - Shelf B"
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    genre: "Fiction, Classic, Dystopian",
    description: "Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.",
    publishedDate: new Date("1961-01-01"),
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg",
    totalCopies: 6,
    availableCopies: 4,
    location: "Fiction Section - Shelf A"
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "9780547928227",
    genre: "Fantasy, Adventure",
    description: "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep.",
    publishedDate: new Date("2012-09-18"),
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
    totalCopies: 3,
    availableCopies: 1,
    location: "Fantasy Section - Shelf C"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    genre: "Fiction, Classic, Romance",
    description: "Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language.",
    publishedDate: new Date("2002-12-31"),
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
    totalCopies: 5,
    availableCopies: 5,
    location: "Fiction Section - Shelf B"
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "9780316769488",
    genre: "Fiction, Classic, Young Adult",
    description: "The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caulfield.",
    publishedDate: new Date("2001-01-30"),
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg",
    totalCopies: 4,
    availableCopies: 3,
    location: "Fiction Section - Shelf C"
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    isbn: "9780441172719",
    genre: "Science Fiction, Fantasy",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange.",
    publishedDate: new Date("1990-09-01"),
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
    totalCopies: 3,
    availableCopies: 2,
    location: "Science Fiction Section - Shelf A"
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    isbn: "9780590353427",
    genre: "Fantasy, Young Adult",
    description: "Harry Potter has no idea how famous he is. That's because he's being raised by his miserable aunt and uncle who are terrified Harry will learn that he's really a wizard, just as his parents were.",
    publishedDate: new Date("1998-09-01"),
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474154022i/3.jpg",
    totalCopies: 8,
    availableCopies: 5,
    location: "Fantasy Section - Shelf B"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log('Connected to MongoDB Atlas');

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Borrowing.deleteMany({});
    
    console.log('Cleared existing data');

    // Insert users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users inserted`);

    // Insert books
    const createdBooks = await Book.create(books);
    console.log(`${createdBooks.length} books inserted`);

    // Create borrowings (with correct references)
    const borrowings = [
      {
        bookId: createdBooks[0]._id,
        userId: createdUsers[2]._id,
        borrowDate: new Date("2025-07-15T10:30:00.000Z"),
        dueDate: new Date("2025-08-15T10:30:00.000Z"),
        returnDate: null,
        status: "borrowed"
      },
      {
        bookId: createdBooks[1]._id,
        userId: createdUsers[2]._id,
        borrowDate: new Date("2025-07-20T14:45:00.000Z"),
        dueDate: new Date("2025-08-20T14:45:00.000Z"),
        returnDate: null,
        status: "borrowed"
      },
      {
        bookId: createdBooks[3]._id,
        userId: createdUsers[3]._id,
        borrowDate: new Date("2025-08-01T09:15:00.000Z"),
        dueDate: new Date("2025-09-01T09:15:00.000Z"),
        returnDate: null,
        status: "borrowed"
      },
      {
        bookId: createdBooks[6]._id,
        userId: createdUsers[1]._id,
        borrowDate: new Date("2025-07-10T16:20:00.000Z"),
        dueDate: new Date("2025-08-10T16:20:00.000Z"),
        returnDate: null,
        status: "borrowed"
      },
      {
        bookId: createdBooks[2]._id,
        userId: createdUsers[2]._id,
        borrowDate: new Date("2025-06-15T11:45:00.000Z"),
        dueDate: new Date("2025-07-15T11:45:00.000Z"),
        returnDate: new Date("2025-07-10T13:30:00.000Z"),
        status: "returned"
      }
    ];

    const createdBorrowings = await Borrowing.create(borrowings);
    console.log(`${createdBorrowings.length} borrowings inserted`);

    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@library.com / password123');
    console.log('Librarian: librarian@library.com / password123');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
