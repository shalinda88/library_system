import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Types
interface Book {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  genre: string[];
  availableCopies: number;
  totalCopies: number;
  publicationYear: number;
  isbn: string;
}

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [genres, setGenres] = useState<string[]>([]);
  
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100
      }
    }
  } as const;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        
        // Replace with your actual API call
        const response = await fetch(`${import.meta.env.VITE_API_URL}/books`);
        const result = await response.json();
        const data = result.items.map((item: any) => ({
          _id: item._id,
          title: item.title,
          author: item.author,
          coverImage: item.coverImage,
          genre: item.genre.split(',').map((g: string) => g.trim()),
          availableCopies: item.availableCopies,
          totalCopies: item.totalCopies,
          publicationYear: new Date(item.publishedDate).getFullYear(),
          isbn: item.isbn,
        }));
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        
        setBooks(data);
        
        // Extract and deduplicate genres
        const allGenres = Array.isArray(data) 
          ? data.flatMap((book: Book) => book.genre) 
          : [];
        const uniqueGenres = [...new Set(allGenres)] as string[];
        setGenres(uniqueGenres);
      } catch (err) {
        setError('Failed to load books. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooks();
  }, []);

  // Filter books based on search term and genre
  const filteredBooks = Array.isArray(books) ? books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = selectedGenre === 'all' || book.genre.includes(selectedGenre);
    
    return matchesSearch && matchesGenre;
  }) : [];
  
  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Browse Books</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Explore our collection of books available in the library.
          </p>
        </div>
        
        {/* Search and filter controls */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <svg 
                className="absolute right-3 top-3 h-5 w-5 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="w-full md:w-1/4">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
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
        ) : filteredBooks.length === 0 ? (
          <div className="text-center my-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No books found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredBooks.map(book => (
              <motion.div 
                key={book._id} 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/books/${book._id}`}>
                  <div className="h-48 overflow-hidden">
                    <img
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      src={book.coverImage || '/placeholder-book.jpg'}
                      alt={book.title}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{book.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        book.availableCopies > 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {book.availableCopies > 0 ? 'Available' : 'Borrowed'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">By {book.author}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {book.genre.slice(0, 2).map((genre, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300"
                        >
                          {genre}
                        </span>
                      ))}
                      {book.genre.length > 2 && (
                        <span className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          +{book.genre.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{book.publicationYear}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {book.availableCopies}/{book.totalCopies} copies
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
  );
};

export default BooksPage;
