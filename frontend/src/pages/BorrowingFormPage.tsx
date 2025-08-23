import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import borrowingService from '../services/borrowingService';
import bookService from '../services/bookService';
import userService from '../services/userService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface BorrowingFormData {
  userId: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
}

interface LocalUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
}

interface Book {
  _id: string;
  id?: string;
  title: string;
  author: string;
  isbn: string;
  availableCopies: number;
}

const BorrowingFormPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [formData, setFormData] = useState<BorrowingFormData>({
    userId: '',
    bookId: '',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 14 days
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [errors, setErrors] = useState<Partial<BorrowingFormData>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [bookSearchQuery, setBookSearchQuery] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch available books and active users
        const [usersResponse, booksResponse] = await Promise.all([
          userService.getUsers({ limit: 100 }), // Get all users
          bookService.getBooks({ limit: 100 }), // Get books with a limit
        ]);

        // Filter out the current user from the users list
        setUsers((usersResponse.items || [])
          .filter(user => user.id !== currentUser?.id) // Filter out the current user
          .map(user => ({
            _id: user.id || '', // Map 'id' to '_id' or use an empty string if 'id' is undefined
            name: user.name,
            email: user.email,
          }))
        );
        
        setBooks((booksResponse.items || []).map(book => ({
          _id: book.id || '', // Map 'id' to '_id' or use an empty string if 'id' is undefined
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          availableCopies: book.availableCopies,
        })));
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await userService.getUsers({ name: searchQuery, limit: 100 });
      setUsers((response.items || [])
        .filter((user: { id?: string }) => user.id !== currentUser?.id) // Filter out the current user
        .map((user: { id?: string; name: string; email: string }) => ({
          _id: user.id || '', // Map 'id' to '_id' or use an empty string if 'id' is undefined
          name: user.name,
          email: user.email,
        }))
      );
    } catch (error) {
      console.error('Error searching users:', error);
    }
    setLoading(true);
    try {
      const response = await userService.getUsers({ name: searchQuery, limit: 100 });
      setUsers((response.items || [])
        .filter(user => user.id !== currentUser?.id) // Filter out the current user
        .map(user => ({
          _id: user.id || '', // Map 'id' to '_id' or use an empty string if 'id' is undefined
          name: user.name,
          email: user.email,
        }))
      );
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBooks = async () => {
    if (!bookSearchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await bookService.getBooks({ query: bookSearchQuery, limit: 100 });
      setBooks((response.items || []).map(book => ({
        _id: book.id || '', // Map 'id' to '_id' or use an empty string if 'id' is undefined
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        availableCopies: book.availableCopies,
      })));
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof BorrowingFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BorrowingFormData> = {};
    
    if (!formData.userId) newErrors.userId = 'User is required';
    if (!formData.bookId) newErrors.bookId = 'Book is required';
    if (!formData.borrowDate) newErrors.borrowDate = 'Borrow date is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    
    // Check if due date is after borrow date
    const borrowDate = new Date(formData.borrowDate);
    const dueDate = new Date(formData.dueDate);
    if (borrowDate > dueDate) {
      newErrors.dueDate = 'Due date must be after borrow date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // Create a borrow form and send it to the service
      const borrowData = {
        bookId: formData.bookId,
        userId: formData.userId,
        dueDate: formData.dueDate
      };
      
      await borrowingService.borrowBook(borrowData);
      navigate('/manage/borrowings');
    } catch (error: any) {
      console.error('Error creating borrowing:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors.reduce(
          (acc: any, err: any) => ({
            ...acc,
            [err.param]: err.msg,
          }),
          {}
        );
        setErrors(backendErrors);
      } else if (error.response?.data?.message) {
        // Handle single error message
        const errorMessage = error.response.data.message;
        
        // Try to determine which field the error relates to
        if (errorMessage.toLowerCase().includes('book')) {
          setErrors(prev => ({ ...prev, bookId: errorMessage }));
        } else if (errorMessage.toLowerCase().includes('user')) {
          setErrors(prev => ({ ...prev, userId: errorMessage }));
        } else {
          // General error
          alert(`Error: ${errorMessage}`);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
    book.isbn.toLowerCase().includes(bookSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Create New Borrowing
        </h1>

        {/* General error message display */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Please correct the following errors:
                </h3>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* User selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select User*
            </label>
            <div className="mb-3">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSearchUsers}
                  className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-auto max-h-60">
              {filteredUsers.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map(user => (
                    <li key={user._id || user.id}>
                      <label className="flex items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="userId"
                          value={user._id || user.id}
                          checked={formData.userId === (user._id || user.id)}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 block">
                          <span className="text-gray-900 dark:text-white font-medium">{user.name}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">{user.email}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 text-gray-500 dark:text-gray-400 text-center">
                  {searchQuery ? 'No matching users found' : 'No other users found. Note: You cannot create borrowings for yourself.'}
                </p>
              )}
            </div>
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.userId}</p>
            )}
          </div>

          {/* Book selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Book*
            </label>
            <div className="mb-3">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search by title, author, or ISBN"
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSearchBooks}
                  className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-auto max-h-60">
              {filteredBooks.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBooks.map(book => (
                    <li key={book._id || book.id}>
                      <label className="flex items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="bookId"
                          value={book._id || book.id}
                          checked={formData.bookId === (book._id || book.id)}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 block">
                          <span className="text-gray-900 dark:text-white font-medium">{book.title}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">by {book.author}</span>
                          {book.availableCopies > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {book.availableCopies} available
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 text-gray-500 dark:text-gray-400 text-center">No books found</p>
              )}
            </div>
            {errors.bookId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bookId}</p>
            )}
          </div>

          {/* Date fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="borrowDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Borrow Date*
              </label>
              <input
                type="date"
                id="borrowDate"
                name="borrowDate"
                value={formData.borrowDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.borrowDate 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.borrowDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.borrowDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date*
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.dueDate 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dueDate}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/manage/borrowings')}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Create Borrowing
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BorrowingFormPage;
