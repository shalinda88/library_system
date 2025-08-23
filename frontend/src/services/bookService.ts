import api from './api';
import type { 
  Book, 
  BookForm, 
  PaginationResult, 
  SearchParams 
} from '../types';

// Book service for interacting with book API
export const bookService = {
  // Get all books with pagination and filters
  async getBooks(params?: SearchParams): Promise<PaginationResult<Book>> {
    const response = await api.get('/books', { params });
    return response.data;
  },
  
  // Get a single book by ID
  async getBookById(id: string): Promise<Book> {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
  
  // Create a new book
  async createBook(data: BookForm): Promise<Book> {
    const response = await api.post('/books', data);
    return response.data;
  },
  
  // Update a book
  async updateBook(id: string, data: Partial<BookForm>): Promise<Book> {
    const response = await api.put(`/books/${id}`, data);
    return response.data;
  },
  
  // Delete a book
  async deleteBook(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },
  
  // Search books
  async searchBooks(query: string, page: number = 1, limit: number = 10): Promise<PaginationResult<Book>> {
    const response = await api.get('/books/search', { 
      params: { query, page, limit } 
    });
    return response.data;
  }
};

export default bookService;
