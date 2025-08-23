// User Role as a type with string literals
export type UserRole = 'USER' | 'LIBRARIAN' | 'ADMIN';

// User Role constants for reference
export const UserRole = {
  USER: 'USER' as UserRole,
  LIBRARIAN: 'LIBRARIAN' as UserRole,
  ADMIN: 'ADMIN' as UserRole
};

// User Interface
export interface User {
  membershipId: string;
  borrowingLimit: number;
  isActive: undefined;
  profilePicture: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Authentication
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword ?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Book Interface
export interface Book {
  book: Book;
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishYear: number;
  genre: string[];
  description: string;
  coverImage?: string;
  available: boolean;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookForm {
  title: string;
  author: string;
  isbn: string;
  publishYear: number;
  genre: string[];
  description: string;
  coverImage?: string;
  totalCopies: number;
}

// Borrowing Interface
export interface Borrowing {
  id: string;
  userId: string;
  user?: User;
  bookId: string;
  book?: Book;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowingStatus;
  createdAt: string;
  updatedAt: string;
}

export type BorrowingStatus = 'PENDING' | 'BORROWED' | 'RETURNED' | 'OVERDUE';

export const BorrowingStatus = {
  PENDING: 'PENDING' as BorrowingStatus,
  BORROWED: 'BORROWED' as BorrowingStatus,
  RETURNED: 'RETURNED' as BorrowingStatus,
  OVERDUE: 'OVERDUE' as BorrowingStatus
}

// Notification Interface
export interface Notification {
  _id: string;
  isRead: boolean;
  updatedAt: string;
  relatedBookId: any;
  relatedBorrowingId: any;
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  entityId?: string;
  entityType?: string;
  createdAt: string;
}

export type NotificationType = 
  'BORROW_REQUEST' | 
  'BORROW_APPROVED' | 
  'BORROW_REJECTED' | 
  'DUE_DATE_REMINDER' | 
  'OVERDUE' | 
  'RETURN_CONFIRMATION' | 
  'SYSTEM';

export const NotificationType = {
  BORROW_REQUEST: 'BORROW_REQUEST' as NotificationType,
  BORROW_APPROVED: 'BORROW_APPROVED' as NotificationType,
  BORROW_REJECTED: 'BORROW_REJECTED' as NotificationType,
  DUE_DATE_REMINDER: 'DUE_DATE_REMINDER' as NotificationType,
  OVERDUE: 'OVERDUE' as NotificationType,
  RETURN_CONFIRMATION: 'RETURN_CONFIRMATION' as NotificationType,
  SYSTEM: 'SYSTEM' as NotificationType
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
export type AuthUser = User & {
  token: string;
};

export type SearchParams = {
  query?: string;
  page?: number;
  limit?: number;
   sort?: string;
};

export type PaginationResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SocketMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
}

export interface BookUpdateEvent {
  bookId: string;
  title: string;
  status: 'available' | 'checked_out' | 'reserved';
  updatedBy: string;
  updatedAt: string;
}