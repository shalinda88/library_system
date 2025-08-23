import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import bookService from '../services/bookService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description: string;
  publishedDate: string;
  totalCopies: number;
  coverImage: string;
}

const initialFormData: BookFormData = {
  title: '',
  author: '',
  isbn: '',
  genre: '',
  description: '',
  publishedDate: '',
  totalCopies: 1,
  coverImage: '',
};

const BookFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<BookFormData>(initialFormData);
  const [loading, setLoading] = useState(isEditMode);
  // Define error type with string messages
  type FormErrors = {
    [K in keyof BookFormData]?: string;
  };
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!isEditMode) return;
      
      try {
        const bookData = await bookService.getBookById(id);
        const book = bookData.book || bookData; // Handle different response formats
        
        // Extract and process the publishedDate
        let publishedDateStr = '';
        
        // Use type assertion to access possible properties
        const bookAny = book as any;
        
        if (bookAny.publishedDate) {
          // If we have a direct publishedDate field
          try {
            const date = new Date(bookAny.publishedDate);
            publishedDateStr = date.getFullYear().toString();
            console.log(`Parsed published date ${bookAny.publishedDate} to year: ${publishedDateStr}`);
          } catch (e) {
            console.error("Error parsing publishedDate:", e);
          }
        } else if (bookAny.publishYear) {
          // Or if we have a publishYear field
          publishedDateStr = bookAny.publishYear.toString();
          console.log(`Using publishYear directly: ${publishedDateStr}`);
        } else if (bookAny.publicationYear) {
          // Check another possible property name
          publishedDateStr = bookAny.publicationYear.toString();
          console.log(`Using publicationYear: ${publishedDateStr}`);
        }
        
        console.log("Book data:", book);
        console.log("Published date/year:", publishedDateStr);
        
        // Convert genre to string if it's an array
        const genreValue = Array.isArray(bookAny.genre) 
          ? bookAny.genre.join(', ') 
          : bookAny.genre || '';
        
        setFormData({
          title: book.title || '',
          author: book.author || '',
          isbn: book.isbn || '',
          genre: genreValue,
          description: book.description || '',
          publishedDate: publishedDateStr,
          totalCopies: book.totalCopies || 1,
          coverImage: book.coverImage || '',
        });
        
        if (book.coverImage) {
          setImagePreview(book.coverImage);
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, isEditMode]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.isbn.trim()) newErrors.isbn = 'ISBN is required';
    if (!formData.genre.trim()) newErrors.genre = 'Genre is required';
    
    // Type-safe check for totalCopies
    const copies = typeof formData.totalCopies === 'number' ? formData.totalCopies : 0;
    if (copies < 1) newErrors.totalCopies = 'At least one copy is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'totalCopies') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error when field is edited
    if (errors[name as keyof BookFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    setImagePreview(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setServerError(null);
    
    try {
      // Transform form data to match the backend's expected format
      // Ensure publishedDate is a valid date
      let publishedDate;
      const currentYear = new Date().getFullYear();
      const publicationYear = formData.publishedDate ? parseInt(formData.publishedDate) : null;
      
      if (!publicationYear && isEditMode) {
        // Don't modify the date if we're editing and no year was provided
        // This prevents overwriting with current year
        publishedDate = undefined;
      } else {
        try {
          // Parse the publication year to a valid date, or use current year
          const year = publicationYear && !isNaN(publicationYear) && publicationYear <= currentYear ? 
            publicationYear : currentYear;
          
          publishedDate = new Date(year, 0, 1).toISOString();
          console.log(`Using publication year: ${year}, ISO date: ${publishedDate}`);
        } catch (e) {
          setServerError(`Invalid publication year: ${formData.publishedDate}`);
          setSubmitting(false);
          return;
        }
      }
      
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        genre: formData.genre,
        description: formData.description,
        ...(publishedDate && { publishedDate }), // Only include if we have a value
        coverImage: formData.coverImage,
        totalCopies: formData.totalCopies,
        location: 'Main Library' // Default required location
      };
      
      if (isEditMode) {
        await bookService.updateBook(id!, bookData as any);
      } else {
        await bookService.createBook(bookData as any);
      }
      
      navigate('/manage/books');
    } catch (error: any) {
      console.error('Error saving book:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        // Process array of errors from backend
        const backendErrors: FormErrors = {};
        
        if (Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach((err: any) => {
            if (err.param && err.msg) {
              backendErrors[err.param as keyof BookFormData] = err.msg;
            }
          });
        } else {
          // Handle object format errors
          const errObj = error.response.data.errors;
          Object.keys(errObj).forEach(key => {
            backendErrors[key as keyof BookFormData] = errObj[key];
          });
        }
        
        setErrors(backendErrors);
      } else if (error.response?.data?.error) {
        // Handle single error message
        setServerError(error.response.data.error);
      } else if (error.response?.data?.message) {
        // Handle general error message
        setServerError(error.response.data.message);
      } else {
        // Generic error
        setServerError('An error occurred while saving the book. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

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
          {isEditMode ? 'Edit Book' : 'Add New Book'}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.title 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Author*
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.author 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.author && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.author}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ISBN*
                </label>
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.isbn 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.isbn && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.isbn}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Genre*
                </label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.genre 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.genre && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.genre}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="publishedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Publication Year (YYYY)
                  </label>
                  <input
                    type="number"
                    id="publishedDate"
                    name="publishedDate"
                    placeholder="e.g. 2024"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.publishedDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="totalCopies" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Copies*
                  </label>
                  <input
                    type="number"
                    id="totalCopies"
                    name="totalCopies"
                    min="1"
                    value={formData.totalCopies}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.totalCopies 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.totalCopies && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.totalCopies}</p>
                  )}
                </div>
              </div>

            </div>

            <div className="col-span-1">
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  id="coverImage"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-3 relative">
                    <div className="w-32 h-48 border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Cover Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/150x225?text=No+Image";
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Cover preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {serverError && (
            <div className="mt-6 px-4 py-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4 w-full">
              <p className="font-medium">Error:</p>
              <p>{serverError}</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/manage/books')}
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
              {isEditMode ? 'Update Book' : 'Create Book'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BookFormPage;
