import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import authService from '../../services/authService';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Auth Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should login a user successfully', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const result = await authService.login(loginData);
    
    expect(result).toEqual(expect.objectContaining({
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      token: 'fake-token-123'
    }));
    
    // Check localStorage
    expect(localStorageMock.getItem('token')).toBe('fake-token-123');
    expect(JSON.parse(localStorageMock.getItem('user') || '{}')).toEqual(expect.objectContaining({
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com'
    }));
  });

  it('should fail login with invalid credentials', async () => {
    const loginData = {
      email: 'wrong@example.com',
      password: 'wrongpass'
    };

    try {
      await authService.login(loginData);
      // If it reaches here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toBe('Invalid email or password');
      }
    }
    
    // Nothing should be saved in localStorage
    expect(localStorageMock.getItem('token')).toBeNull();
    expect(localStorageMock.getItem('user')).toBeNull();
  });

  it('should register a new user', async () => {
    const registerData = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    };

    const result = await authService.register(registerData);
    
    expect(result).toEqual(expect.objectContaining({
      _id: 'newuser123',
      name: 'New User',
      email: 'new@example.com',
      token: 'new-fake-token-123'
    }));
    
    // Check localStorage
    expect(localStorageMock.getItem('token')).toBe('new-fake-token-123');
    expect(JSON.parse(localStorageMock.getItem('user') || '{}')).toEqual(expect.objectContaining({
      _id: 'newuser123',
      name: 'New User',
      email: 'new@example.com'
    }));
  });

  it('should logout a user', () => {
    // Setup: first login a user
    localStorageMock.setItem('token', 'fake-token-123');
    localStorageMock.setItem('user', JSON.stringify({
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com'
    }));
    
    // Perform logout
    authService.logout();
    
    // Check localStorage is cleared
    expect(localStorageMock.getItem('token')).toBeNull();
    expect(localStorageMock.getItem('user')).toBeNull();
  });

  it('should return null for getCurrentUser when not logged in', () => {
    const user = authService.getCurrentUser();
    expect(user).toBeNull();
  });

  it('should return user for getCurrentUser when logged in', () => {
    // Setup: login a user
    const userData = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };
    localStorageMock.setItem('user', JSON.stringify(userData));
    
    const user = authService.getCurrentUser();
    expect(user).toEqual(expect.objectContaining(userData));
  });

  it('should return token for getToken when logged in', () => {
    // Setup: save a token
    localStorageMock.setItem('token', 'fake-token-123');
    
    const token = authService.getToken();
    expect(token).toBe('fake-token-123');
  });
});
