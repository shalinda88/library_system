import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import userService from '../services/userService';
import borrowingService from '../services/borrowingService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { User, Borrowing } from '../types';

const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowingsLoading, setBorrowingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const userData = await userService.getUserById(id);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to load user details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserBorrowings = async () => {
      if (!id) return;
      
      try {
        setBorrowingsLoading(true);
        const response = await borrowingService.getUserBorrowingHistory(id);
        setBorrowings(response.items || []);
      } catch (error) {
        console.error('Error fetching user borrowings:', error);
      } finally {
        setBorrowingsLoading(false);
      }
    };

    fetchUser();
    fetchUserBorrowings();
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

  const handleDelete = async () => {
    try {
      await userService.deleteUser(id as string);
      navigate('/manage/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again later.');
      setShowDeleteModal(false);
    }
  };

  const userRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Admin
          </span>
        );
      case 'librarian':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Librarian
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            User
          </span>
        );
    }
  };

  const getBorrowingStatus = (borrowing: any) => {
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
          onClick={() => navigate('/manage/users')} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Users
        </button>
      </div>
    );
  }

  if (!user) {
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
              <p className="text-sm text-yellow-700">User not found.</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/manage/users')} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/manage/users')} 
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Profile</h1>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Link 
            to={`/manage/users/edit/${user._id}`} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit User
          </Link>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Information Card */}
        <div className="lg:col-span-1">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 mb-4">
               
                    <span className="text-4xl">{user.name.charAt(0).toUpperCase()}</span>
                  
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                <div className="mt-2">
                  {userRoleBadge(user.role)}
                </div>
                <div className="mt-2">
                  {user.isActive ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-gray-500 dark:text-gray-400">Member ID:</div>
                  <div className="text-right font-medium text-gray-900 dark:text-white">{user.membershipId}</div>
                  
                  <div className="text-gray-500 dark:text-gray-400">Books Borrowed:</div>
                  <div className="text-right font-medium text-gray-900 dark:text-white">{user.borrowedBooks} / {user.borrowingLimit}</div>
                  
                  <div className="text-gray-500 dark:text-gray-400">Joined On:</div>
                  <div className="text-right font-medium text-gray-900 dark:text-white">{formatDate(user.createdAt)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Borrowing History */}
        <div className="lg:col-span-2">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Borrowing History</h2>
              
              {borrowingsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <LoadingSpinner />
                </div>
              ) : borrowings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-left">
                      <tr>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Book</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Borrowed Date</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {borrowings.map((borrowing) => {
                        const status = getBorrowingStatus(borrowing);
                        const book = typeof borrowing.bookId === 'object' ? borrowing.bookId : null;
                        
                        return (
                          <tr key={borrowing._id || borrowing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3">
                              <Link to={`/books/${book?._id || borrowing.bookId}`} className="text-blue-600 hover:text-blue-800">
                                {book?.title || 'Book data unavailable'}
                              </Link>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {formatDate(borrowing.borrowDate)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {formatDate(borrowing.dueDate)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${status.class}`}>
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  This user hasn't borrowed any books yet.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this user? This action cannot be undone and will remove all data associated with this account.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsPage;
