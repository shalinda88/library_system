import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import bookService from '../services/bookService';
import borrowingService from '../services/borrowingService';
import userService from '../services/userService';
import type { Book, Borrowing, User } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalBorrowings: 0,
    availableBooks: 0,
    overdueBooks: 0
  });
  const [recentBorrowings, setRecentBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Get summary statistics
        const bookStats = await bookService.getBooks({ limit: 1 });
        const userStats = await userService.getUsers({ limit: 1 });
        const borrowingStats = await borrowingService.getBorrowings({ limit: 1 });
        const overdueStats = await borrowingService.getBorrowings({ overdue: true, limit: 1 });

        setStats({
          totalBooks: bookStats.total || 0,
          totalUsers: userStats.total || 0,
          totalBorrowings: borrowingStats.total || 0,
          availableBooks: bookStats.items?.reduce((acc: number, book: Book) => acc + (book.availableCopies || 0), 0) || 0,
          overdueBooks: overdueStats.total || 0
        });

        // Get recent borrowings
        const borrowingsResponse = await borrowingService.getBorrowings({ 
          page: 1, 
          limit: 10,
          sort: '-createdAt' // Most recent first
        });
        setRecentBorrowings(borrowingsResponse.items || []);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Welcome back, {user?.name}. Here's your library overview.</p>
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/manage/books/create" className="bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-200 px-4 py-2 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Book
          </Link>
          <Link to="/manage/users/create" className="bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900 dark:hover:bg-purple-800 dark:text-purple-200 px-4 py-2 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Add New User
          </Link>
          <Link to="/admin/notifications" className="bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900 dark:hover:bg-amber-800 dark:text-amber-200 px-4 py-2 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Send Notifications
          </Link>
        </div>
      </motion.div>
      
      {/* Recent Borrowings */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Borrowings</h2>
          <Link to="/borrowings" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 text-left">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Book</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Borrowed</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentBorrowings.length > 0 ? (
                recentBorrowings.map((borrowing: any) => (
                  <tr key={borrowing._id || borrowing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {typeof borrowing.userId === 'object' ? borrowing.userId.name : 'Unknown User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {typeof borrowing.bookId === 'object' ? borrowing.bookId.title : 'Unknown Book'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(borrowing.borrowDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(borrowing.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${borrowing.status === 'borrowed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                          borrowing.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                          borrowing.status === 'returned' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                      >
                        {borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/borrowings/${borrowing._id || borrowing.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No borrowings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
};

export default AdminDashboardPage;
