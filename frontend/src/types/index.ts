// Book types
export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description: string;
  publishedDate: string;
  coverImage: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
  createdAt: string;
  updatedAt: string;
  status?: 'Available' | 'Unavailable';
}

// User types
export const UserRole = {
  USER: 'user',
  LIBRARIAN: 'librarian',
  ADMIN: 'admin'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRoleType;
  profilePicture?: string;
  membershipId: string;
  borrowingLimit: number;
  borrowedBooks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends Omit<User, 'updatedAt'> {
  token: string;
}

// Borrowing types
export const BorrowingStatus = {
  BORROWED: 'borrowed',
  RETURNED: 'returned',
  OVERDUE: 'overdue',
  LOST: 'lost'
} as const;

export type BorrowingStatusType = typeof BorrowingStatus[keyof typeof BorrowingStatus];

export interface Borrowing {
  _id: string;
  userId: string | User;
  bookId: string | Book;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowingStatusType;
  fine?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification types
export const NotificationType = {
  DUE_DATE_REMINDER: 'due_date_reminder',
  OVERDUE: 'overdue',
  BOOK_AVAILABLE: 'book_available',
  RETURN_CONFIRMATION: 'return_confirmation',
  SYSTEM: 'system'
} as const;

export type NotificationTypeType = typeof NotificationType[keyof typeof NotificationType];

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationTypeType;
  message: string;
  relatedBookId?: string | Book;
  relatedBorrowingId?: string | Borrowing;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Pagination types
export interface PaginationResult<T> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Socket Event types
export interface SocketMessage {
  from: string;
  message: string;
}

export interface SocketNotification {
  id: string;
  notification: Notification;
}

export interface BookUpdateEvent {
  bookId: string;
  availableCopies: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface BookForm {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description: string;
  publishedDate: string;
  coverImage?: string;
  totalCopies: number;
  location: string;
}

export interface BorrowForm {
  bookId: string;
  userId: string;
  dueDate?: string;
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  title?: string;
  author?: string;
  genre?: string;
  available?: boolean;
  sort?: string;
}
