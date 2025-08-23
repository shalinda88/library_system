import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Local interface for component use
interface Borrowing {
  _id: string;
  book: {
    _id: string;
    title: string;
    author: string;
    coverImage: string;
  };
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'borrowed' | 'returned' | 'overdue';
}

const BorrowingsPage = () => {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    const fetchBorrowings = async () => {
      try {
        if (!user) return;
        
        setLoading(true);
        
        // Make direct API call with query parameters
        const response = await api.get('/borrowings', {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            userId: user.id, // Filter by current user
            status: activeTab === 'active' ? 'BORROWED' : undefined
          }
        });
        
        if (response && response.data && response.data.items) {
          setBorrowings(response.data.items);
          setPagination(prev => ({
            ...prev,
            totalPages: response.data.totalPages,
            totalItems: response.data.totalItems
          }));
        }
      } catch (err) {
        setError('Failed to load borrowings. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBorrowings();
  }, [user, pagination.page, pagination.limit, activeTab]);

  const handleRenew = async (borrowingId: string) => {
    try {
      // Use API service
      const response = await api.put(`/borrowings/${borrowingId}/renew`);
      
      const updatedBorrowing = response.data;
      
      // Update the borrowings list with the renewed item
      setBorrowings(prevBorrowings => 
        prevBorrowings.map(borrowing => 
          borrowing._id === updatedBorrowing._id ? updatedBorrowing : borrowing
        )
      );
    } catch (err) {
      setError('Failed to renew book. Please try again later.');
      console.error(err);
    }
  };

  const handleReturn = async (borrowingId: string) => {
    try {
      // Use API service
      const response = await api.put(`/borrowings/${borrowingId}/return`);
      
      const updatedBorrowing = response.data;
      
      // Update the borrowings list with the returned item
      setBorrowings(prevBorrowings => 
        prevBorrowings.map(borrowing => 
          borrowing._id === updatedBorrowing._id ? updatedBorrowing : borrowing
        )
      );
    } catch (err) {
      setError('Failed to return book. Please try again later.');
      console.error(err);
    }
  };

  // Get days remaining or days overdue
  const getDaysInfo = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      days: Math.abs(diffDays),
      isOverdue: diffDays < 0
    };
  };

  const filteredBorrowings = borrowings.filter(borrowing => {
    if (activeTab === 'active') {
      return borrowing.returnDate === null;
    } else {
      return borrowing.returnDate !== null;
    }
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100
      }
    }
  } as const;

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Borrowings</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Track your borrowed books and their due dates.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'active' 
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Active Borrowings
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'history' 
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Borrowing History
            </button>
          </nav>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <LoadingSpinner size="lg" color="primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 my-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredBorrowings.length === 0 ? (
          <div className="text-center my-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              {activeTab === 'active' ? 'No active borrowings' : 'No borrowing history'}
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {activeTab === 'active' ? "You don't have any active borrowings at the moment." : "You haven't returned any books yet."}
            </p>
            {activeTab === 'active' && (
              <div className="mt-6">
                <Link
                  to="/books"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Books
                </Link>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible" 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredBorrowings.map(borrowing => {
              const daysInfo = getDaysInfo(borrowing.dueDate);
              
              return (
                <motion.div 
                  key={borrowing._id}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
                >
                  <div className="p-4 flex flex-col h-full">
                    <div className="flex-shrink-0 h-48 w-full mb-4">
                      <img
                        className="h-full w-full object-cover rounded-md"
                        src={borrowing.book.coverImage || '/placeholder-book.jpg'}
                        alt={borrowing.book.title}
                      />
                    </div>
                    <div className="flex-grow">
                      <Link to={`/books/${borrowing.book._id}`}>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg hover:text-blue-600 dark:hover:text-blue-400">
                          {borrowing.book.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">by {borrowing.book.author}</p>
                      
                      {/* Borrowing details */}
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Borrowed:</span>
                          <span className="text-gray-900 dark:text-gray-200">
                            {new Date(borrowing.borrowDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Due date:</span>
                          <span className="text-gray-900 dark:text-gray-200">
                            {new Date(borrowing.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {borrowing.returnDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Returned:</span>
                            <span className="text-gray-900 dark:text-gray-200">
                              {new Date(borrowing.returnDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        {!borrowing.returnDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                            <span className={`font-medium ${
                              daysInfo.isOverdue 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {daysInfo.isOverdue 
                                ? `${daysInfo.days} day${daysInfo.days !== 1 ? 's' : ''} overdue` 
                                : `${daysInfo.days} day${daysInfo.days !== 1 ? 's' : ''} remaining`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!borrowing.returnDate && (
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleRenew(borrowing._id)}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                        >
                          Renew
                        </button>
                        <button
                          onClick={() => handleReturn(borrowing._id)}
                          className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                        >
                          Return
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
  );
};

export default BorrowingsPage;
