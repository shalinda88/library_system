import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import bookService from '../services/bookService';
import borrowingService from '../services/borrowingService';
import notificationService from '../services/notificationService';
import type { Book, Borrowing, Notification } from '../types/index';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [userBorrowings, setUserBorrowings] = useState<Borrowing[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState({
    books: true,
    borrowings: true,
    notifications: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent books
        const booksResponse = await bookService.getBooks({ 
          page: 1, 
          limit: 5,
          sort: 'createdAt'
        });
        // Use type assertion to avoid TypeScript errors
        setRecentBooks(booksResponse.items as any || []);
        setIsLoading(prev => ({ ...prev, books: false }));
        
        // Fetch user's borrowings
        if (user) {
          // Fetch borrowings with user ID filter
          const borrowingsResponse = await borrowingService.getBorrowings({
            userId: user.id
          });
          // Use type assertion to avoid TypeScript errors
          setUserBorrowings(borrowingsResponse.items as any || []);
          setIsLoading(prev => ({ ...prev, borrowings: false }));
          
          // Fetch user's notifications
          try {
            const notificationsResponse = await notificationService.getUserNotifications(
              user.id, 
              1, 
              5
            );
            // Use type assertion to avoid TypeScript errors
            setNotifications(notificationsResponse.items as any || []);
          } catch (notifError) {
            console.error('Error fetching notifications:', notifError);
            setNotifications([]);
          }
          setIsLoading(prev => ({ ...prev, notifications: false }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading({
          books: false,
          borrowings: false,
          notifications: false
        });
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
      <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-3xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome, {user?.name}!
      </motion.h1>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2  gap-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Recent Books Section */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          variants={item}
        >
          <div className="p-5 bg-blue-600 text-white">
            <h2 className="text-xl font-semibold">Recent Books</h2>
          </div>
          <div className="p-5">
            {isLoading.books ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentBooks.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentBooks.map((book: any) => (
                  <li key={book._id || book.id} className="py-3">
                    <Link to={`/books/${book._id || book.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 -mx-5 px-5 py-2 rounded-md transition-colors">
                      <h3 className="font-medium text-blue-600 dark:text-blue-400">{book.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {book.author}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">{book.genre}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${book.availableCopies > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                          {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No books available.</p>
            )}

            <div className="mt-4">
              <Link 
                to="/books" 
                className="inline-block w-full text-center py-2 px-4 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md transition-colors"
              >
                View All Books
              </Link>
            </div>
          </div>
        </motion.div>

{user?.role === "USER" && (
  <motion.div 
    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    variants={item}
  >
    <div className="p-5 bg-purple-600 text-white">
      <h2 className="text-xl font-semibold">My Borrowings</h2>
    </div>
    <div className="p-5">
      {isLoading.borrowings ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : userBorrowings.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {userBorrowings.map((borrowing: any) => (
            <li key={borrowing._id || borrowing.id} className="py-3">
              <Link to={`/borrowings/${borrowing._id || borrowing.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 -mx-5 px-5 py-2 rounded-md transition-colors">
                <h3 className="font-medium text-purple-600 dark:text-purple-400">
                  {typeof borrowing.bookId === 'string' ? 'Book' : borrowing.bookId.title}
                </h3>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Due: {new Date(borrowing.dueDate).toLocaleDateString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    borrowing.status === 'borrowed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                    borrowing.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    borrowing.status === 'returned' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 py-4 text-center">You have no active borrowings.</p>
      )}

      <div className="mt-4">
        <Link 
          to="/borrowings" 
          className="inline-block w-full text-center py-2 px-4 border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white rounded-md transition-colors"
        >
          View All Borrowings
        </Link>
      </div>
    </div>
  </motion.div>
)}
  

      </motion.div>
    </div>
  );
};

export default Dashboard;
