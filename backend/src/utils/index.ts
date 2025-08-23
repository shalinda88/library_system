import { Types } from 'mongoose';
import config from '../config/index.js';

// Generate a random membership ID
export const generateMembershipId = (): string => {
  const prefix = 'LIB';
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const year = new Date().getFullYear();
  return `${prefix}${year}${randomDigits}`;
};

// Calculate due date (default: 14 days from borrowing)
export const calculateDueDate = (days: number = 14): Date => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
};

// Calculate overdue fine (default: $0.25 per day)
export const calculateFine = (dueDate: Date, returnDate: Date = new Date(), ratePerDay: number = 0.25): number => {
  if (returnDate <= dueDate) return 0;
  
  const overdueDays = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  return overdueDays * ratePerDay;
};

// Check if MongoDB ID is valid
export const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

// Format date for display
export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Pagination helper
export interface PaginationResult<T> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const paginate = async <T>(
  model: any,
  query: any = {},
  options: {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
    populate?: string | string[];
    select?: string;
  } = {}
): Promise<PaginationResult<T>> => {
  const page = Math.max(1, options.page || 1);
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  
  console.log('Pagination function received:', { 
    page: options.page, 
    limit: options.limit,
    calculatedPage: page,
    calculatedLimit: limit,
    skip
  });
  
  const [items, totalItems] = await Promise.all([
    model
      .find(query)
      .sort(options.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(options.populate || '')
      .select(options.select || '')
      .exec(),
    model.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    items,
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};
