import api from './api';
import type { 
  Borrowing, 
  PaginationResult 
} from '../types';

// BorrowForm interface from types
interface BorrowForm {
  bookId: string;
  userId: string;
  dueDate?: string;
}

// Borrowing service for interacting with borrowing API
export const borrowingService = {
  // Borrow a book
  async borrowBook(data: BorrowForm): Promise<{ message: string; borrowing: Borrowing }> {
    const response = await api.post('/borrowings', data);
    return response.data;
  },
  
  // Return a book
  async returnBook(id: string, condition?: string): Promise<{ message: string; borrowing: Borrowing }> {
    const response = await api.put(`/borrowings/${id}/return`, { condition });
    return response.data;
  },
  
  // Get all borrowings with filters
  async getBorrowings(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    bookId?: string;
    status?: string;
    overdue?: boolean;
    sort?: String;
  }): Promise<PaginationResult<Borrowing>> {
    const response = await api.get('/borrowings', { params });
    return response.data;
  },
  
  // Get a single borrowing record
  async getBorrowingById(id: string): Promise<Borrowing> {
    const response = await api.get(`/borrowings/${id}`);
    return response.data;
  },
  
  // Get borrowing history for a user
  async getUserBorrowingHistory(userId: string, page: number = 1, limit: number = 10): Promise<PaginationResult<Borrowing>> {
    const response = await api.get(`/borrowings/user/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  }
};

export default borrowingService;
