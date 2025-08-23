import api from './api';
import type { 
  User, 
  UserRole, 
  PaginationResult 
} from '../types';

// User service for interacting with user API
export const userService = {
  // Get all users with pagination and filters
  async getUsers(params?: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
  }): Promise<PaginationResult<User>> {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  // Get a single user by ID
  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  // Create a new user (admin only)
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    role?: string; // Accept string for role instead of UserRole enum
    membershipId?: string;
    borrowingLimit?: number;
    isActive?: boolean;
    profilePicture?: string;
  }): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },
  
  // Update a user (admin only)
  async updateUser(
    id: string, 
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: string; // Accept string for role instead of UserRole enum
      membershipId?: string;
      borrowingLimit?: number;
      isActive?: boolean;
      profilePicture?: string;
    }
  ): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  
  // Delete a user (admin only)
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;
