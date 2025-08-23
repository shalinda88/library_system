import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import bookService from '../services/bookService';
import borrowingService from '../services/borrowingService';

// Types
interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  genre: string[];
  availableCopies: number;
  totalCopies: number;
  publicationYear: number;
  isbn: string;
  publisher: string;
  reviews: Review[];
  averageRating: number;
}

const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowStatus, setBorrowStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [borrowError, setBorrowError] = useState('');

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Use bookService to fetch book details
        const data:any = await bookService.getBookById(id);
        setBook(data);
      } catch (err) {
        setError('Failed to load book details. Please try again later.');
        console.error('Error fetching book details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [id]);

  const handleBorrow = async () => {
    if (!user || !book) return;
    
    setBorrowStatus('loading');
    
    try {
      // Use borrowingService to borrow book
      await borrowingService.borrowBook({
        bookId: book._id,
        userId: user.id
      });
      
      setBorrowStatus('success');
      // Update book's available copies
      setBook(prevBook => {
        if (!prevBook) return null;
        return {
          ...prevBook,
          availableCopies: prevBook.availableCopies - 1
        };
      });
      
      setTimeout(() => {
        navigate('/borrowings');
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setBorrowError(err.message);
      } else {
        setBorrowError('Failed to borrow book. Please try again later.');
      }
      setBorrowStatus('error');
    }
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < Math.floor(rating) 
            ? 'text-yellow-400' 
            : index < rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300 dark:text-gray-600'
        }`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">{error || 'Book not found'}</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">We couldn't find the book you're looking for.</p>
        <div className="mt-6">
          <Link to="/books" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            ← Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex py-4 text-sm text-gray-500 dark:text-gray-400">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-200">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to="/books" className="ml-1 hover:text-gray-700 dark:hover:text-gray-200 md:ml-2">
                  Books
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2 dark:text-gray-400" aria-current="page">
                  {book.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="md:flex">
            <div className="md:flex-shrink-0 md:w-1/3 p-6">
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={book.coverImage || '/placeholder-book.jpg'}
                alt={book.title}
                className="w-full h-auto object-cover rounded-lg shadow-md"
              />

              <div className="mt-4 flex flex-col space-y-3">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium w-24">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    book.availableCopies > 0 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium w-24">Available:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-200">{book.availableCopies}/{book.totalCopies} copies</span>
                </div>

                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium w-24">ISBN:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-200">{book.isbn}</span>
                </div>

                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium w-24">Published:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-200">{book.publicationYear} by {book.publisher}</span>
                </div>

              </div>
            </div>

            <div className="md:w-2/3 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {book.title}
                  </h1>
                  <p className="mt-1 text-xl text-gray-600 dark:text-gray-300">by {book.author}</p>
                </div>
              
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Description</h2>
                <div className="mt-2 text-gray-600 dark:text-gray-300 space-y-4">
                  <p>{book.description}</p>
                </div>
              </div>

              <div className="mt-6 hidden">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Genres</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.isArray(book.genre) && book.genre.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {genre}
                    </span>
                  ))}
                  
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
  );
};

export default BookDetailsPage;
