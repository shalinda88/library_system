import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import borrowingService from '../services/borrowingService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const BorrowingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [borrowing, setBorrowing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    const fetchBorrowing = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await borrowingService.getBorrowingById(id);
        setBorrowing(data);
      } catch (error) {
        console.error('Error fetching borrowing details:', error);
        setError('Failed to load borrowing details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowing();
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReturn = async () => {
    try {
      await borrowingService.returnBook(id as string);
      // Refresh data after return
      const data = await borrowingService.getBorrowingById(id as string);
      setBorrowing(data);
      setShowReturnModal(false);
    } catch (error) {
      console.error('Error returning book:', error);
      setError('Failed to return the book. Please try again later.');
    }
  };

  const getBorrowingStatus = () => {
    if (!borrowing) return { label: 'Unknown', class: 'bg-gray-100 text-gray-800' };

    if (borrowing.returnDate) {
      return {
        label: 'Returned',
        class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      };
    }
    
    const dueDate = new Date(borrowing.dueDate);
    const today = new Date();
    
    if (dueDate < today) {
      return {
        label: 'Overdue',
        class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      };
    }
    
    // Due date is within next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    if (dueDate <= threeDaysFromNow) {
      return {
        label: 'Due Soon',
        class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      };
    }
    
    return {
      label: 'Active',
      class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/manage/borrowings')} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Borrowings
        </button>
      </div>
    );
  }

  if (!borrowing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Borrowing record not found.</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/manage/borrowings')} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Borrowings
        </button>
      </div>
    );
  }

  const status = getBorrowingStatus();
  
  // Handle different possible structures of the API response
  const user = typeof borrowing.userId === 'object' 
    ? borrowing.userId 
    : typeof borrowing.user === 'object'
      ? borrowing.user
      : null;
      
  const book = typeof borrowing.bookId === 'object' 
    ? borrowing.bookId 
    : typeof borrowing.book === 'object'
      ? borrowing.book
      : null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate('/manage/borrowings')} 
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Borrowings
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Borrowing Details</h1>
      </div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6">
          {/* Status Badge */}
          <div className="flex justify-between items-center mb-6">
            <span className={`px-3 py-1 text-sm rounded-full ${status.class}`}>
              {status.label}
            </span>

            {!borrowing.returnDate && (
              <button
                onClick={() => setShowReturnModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Return Book
              </button>
            )}
          </div>

          {/* Borrowing Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Book Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Book Information</h2>
              {book ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  {book.coverImage && (
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-40 h-auto object-cover rounded-md mx-auto mb-4 shadow-md"
                    />
                  )}
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">{book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">by {book.author}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500 dark:text-gray-400">ISBN:</div>
                    <div className="text-gray-800 dark:text-white font-medium">{book.isbn}</div>
                    
                 
                  </div>
                  
                  <Link 
                    to={`/books/${book._id}`}
                    className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    View Book Details
                    <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Book information not available</p>
              )}
            </div>

            {/* Right Column - Borrowing and User Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Borrowing Details</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="text-gray-500 dark:text-gray-400">Borrowing ID:</div>
                  <div className="text-gray-800 dark:text-white font-medium">{borrowing._id}</div>
                  
                  <div className="text-gray-500 dark:text-gray-400">Borrow Date:</div>
                  <div className="text-gray-800 dark:text-white font-medium">{formatDate(borrowing.borrowDate)}</div>
                  
                  <div className="text-gray-500 dark:text-gray-400">Due Date:</div>
                  <div className="text-gray-800 dark:text-white font-medium">{formatDate(borrowing.dueDate)}</div>
                  
                  <div className="text-gray-500 dark:text-gray-400">Return Date:</div>
                  <div className="text-gray-800 dark:text-white font-medium">
                    {borrowing.returnDate ? formatDate(borrowing.returnDate) : 'Not returned yet'}
                  </div>
                  
                  {borrowing.fine > 0 && (
                    <>
                      <div className="text-gray-500 dark:text-gray-400">Fine:</div>
                      <div className="text-red-600 dark:text-red-400 font-medium">
                        ${borrowing.fine.toFixed(2)}
                      </div>
                    </>
                  )}
                  
                  {borrowing.notes && (
                    <>
                      <div className="text-gray-500 dark:text-gray-400">Notes:</div>
                      <div className="text-gray-800 dark:text-white font-medium">{borrowing.notes}</div>
                    </>
                  )}
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">User Information</h2>
              {user ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 mr-3">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.name} 
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <span className="text-xl">{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">{user.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500 dark:text-gray-400">Membership ID:</div>
                    <div className="text-gray-800 dark:text-white font-medium">{user.membershipId}</div>
                  
                  </div>
                  
                  <Link 
                    to={`/manage/users/${user._id}`}
                    className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    View User Profile
                    <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">User information not available</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Return Confirmation Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm Book Return</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to mark this book as returned? This will update the inventory and close the borrowing record.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowingDetailsPage;
