import api from './api';
import type { LoginForm, RegisterForm, AuthUser, User } from '../types';

// Authentication service for login, register, etc.
export const authService = {
  // Login user
  async login(data: LoginForm): Promise<AuthUser> {
    try {
      const response = await api.post('/auth/login', data);
      
      // Save token and user to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      // Better error handling with specific messages
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw error;
    }
  },
  
  // Register user
  async register(data: RegisterForm): Promise<AuthUser> {
    try {
      const response = await api.post('/auth/register', data);
      
      // Save token and user to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      // Better error handling with specific messages
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw error;
    }
  },
  
  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', data);
    
    // Update stored user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...user, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return response.data;
  },
  
  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },
  
  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  },
  
  // Get current user from localStorage
  getCurrentUser(): AuthUser | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Get auth token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }
};

export default authService;
