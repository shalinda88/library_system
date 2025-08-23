import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import borrowingService from '../services/borrowingService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ManageBorrowingsPage = () => {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, returned, overdue
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [borrowingToReturn, setBorrowingToReturn] = useState<string | null>(null);

  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const params: any = { 
        page: currentPage,
        limit: 10,
      };

      // Add search if present
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add status filter based on the backend API expectations
      if (filter === 'active') {
        params.status = 'borrowed';
      } else if (filter === 'returned') {
        params.status = 'returned';
      } else if (filter === 'overdue') {
        params.status = 'overdue';
        // Alternative approach: params.overdue = 'true';
      }
      
      const response = await borrowingService.getBorrowings(params);
      setBorrowings(response.items || []);
      setTotalPages(Math.ceil((response.total || 0) / 10));
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, [currentPage, searchTerm, filter, refreshTrigger]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const confirmReturn = (borrowingId: string) => {
    setBorrowingToReturn(borrowingId);
    setShowReturnModal(true);
  };

  const handleReturn = async () => {
    if (!borrowingToReturn) return;

    try {
      await borrowingService.returnBook(borrowingToReturn);
      setShowReturnModal(false);
      setBorrowingToReturn(null);
      setRefreshTrigger(prev => prev + 1); // Trigger re-fetch
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBorrowingStatus = (borrowing: any) => {
    // Check both possible names for the return date field
    if (borrowing.returnedDate || borrowing.returnDate) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Borrowings</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">View and manage book borrowings and returns.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            to="/manage/borrowings/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Borrowing
          </Link>
        </div>
      </div>

      {/* Borrowings Table */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 text-left">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Book</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Borrowed Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Returned Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : borrowings.length > 0 ? (
                borrowings.map(borrowing => {
                  const status = getBorrowingStatus(borrowing);
                  return (
                    <tr key={borrowing._id || borrowing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(typeof borrowing.bookId === 'object' ? borrowing.bookId?.title : borrowing.book?.title) || 'Book data unavailable'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {(typeof borrowing.bookId === 'object' ? borrowing.bookId?.isbn : borrowing.book?.isbn) || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(typeof borrowing.userId === 'object' ? borrowing.userId?.name : borrowing.user?.name) || 'User data unavailable'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {(typeof borrowing.userId === 'object' ? borrowing.userId?.email : borrowing.user?.email) || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {borrowing.borrowDate ? formatDate(borrowing.borrowDate) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {borrowing.dueDate ? formatDate(borrowing.dueDate) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {borrowing.returnDate ? formatDate(borrowing.returnDate) : (borrowing.returnedDate ? formatDate(borrowing.returnedDate) : 'Not returned')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link 
                            to={`/manage/borrowings/${borrowing._id || borrowing.id}`} 
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View
                          </Link>
                          {(!borrowing.returnedDate && !borrowing.returnDate) && (
                            <button
                              onClick={() => confirmReturn(borrowing._id || borrowing.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No borrowings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
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

export default ManageBorrowingsPage;
