import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import bookService from '../services/bookService';
import type { Book } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Get recent books
        const recentResponse = await bookService.getBooks({
          page: 1,
          limit: 6,
          sort: 'createdAt'
        });

        // Get popular books (most borrowed)
        const popularResponse = await bookService.getBooks({
          page: 1,
          limit: 6,
          sort: 'borrowCount' // Assuming there's a borrowCount field to sort by
        });

        setFeaturedBooks(recentResponse.items);
        setPopularBooks(popularResponse.items);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-800 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Discover, Borrow, and Learn
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Explore our vast collection of books and resources. Your gateway to knowledge awaits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/books" 
                className="bg-white text-blue-600 hover:bg-blue-100 px-6 py-3 rounded-lg font-medium text-lg transition-colors duration-300"
              >
                Browse Books
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-500 text-white border border-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium text-lg transition-colors duration-300"
              >
                Join Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            What Our Library Offers
          </motion.h2>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
              variants={itemVariants}
            >
              <div className="bg-blue-100 dark:bg-blue-900 inline-flex p-4 rounded-full mb-6">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Extensive Collection</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access thousands of books across various genres, from classic literature to contemporary bestsellers.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
              variants={itemVariants}
            >
              <div className="bg-purple-100 dark:bg-purple-900 inline-flex p-4 rounded-full mb-6">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Easy Borrowing</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Borrow books with just a few clicks and manage your borrowings from your personalized dashboard.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
              variants={itemVariants}
            >
              <div className="bg-green-100 dark:bg-green-900 inline-flex p-4 rounded-full mb-6">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Real-time Notifications</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with due dates, available books, and library announcements through our real-time notification system.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Books</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBooks.map(book => (
                <Link 
                  to={`/books/${book.id}`}
                  key={book.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="aspect-w-2 aspect-h-3 bg-gray-200 dark:bg-gray-700">
                    {book.coverImage ? (
                      <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-blue-50 dark:bg-blue-900">
                        <svg className="w-16 h-16 text-blue-200 dark:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">{book.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">by {book.author}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{book.genre}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        book.availableCopies > 0 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link 
              to="/books"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Books
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Reading?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our library today and get access to thousands of books. Create your free account now!
          </p>
          <Link 
            to="/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
