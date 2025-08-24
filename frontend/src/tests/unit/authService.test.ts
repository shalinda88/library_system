import { describe, it, expect, beforeEach, vi } from 'vitest';
import authService from '../../services/authService';

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
        email: 'admin@library.com',
        password: 'Abcd!234'
    };

    const result = await authService.login(loginData);
    
    // Check user properties
    expect(result).toEqual(expect.objectContaining({
        _id: '68a80d33727d8b0ae88cd4fe',
        name: 'Admin User',
        email: 'admin@library.com',
        role: 'admin',
        membershipId: 'ADM001',
    }));
    
    // Check that token exists and is a JWT (starts with eyJ)
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.token).toMatch(/^eyJ/);
    
    // Check localStorage - don't check exact token value
    const storedToken = localStorageMock.getItem('token');
    expect(storedToken).toBeDefined();
    expect(storedToken).toBe(result.token);
    
    // Check user data in localStorage
    const storedUser = JSON.parse(localStorageMock.getItem('user') || '{}');
    expect(storedUser).toEqual(expect.objectContaining({
        _id: '68a80d33727d8b0ae88cd4fe',
        name: 'Admin User',
        email: 'admin@library.com',
        role: 'admin',
        membershipId: 'ADM001'
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
        name: 'New User3',
        email: `newuser${Date.now()}@library.com`,
        password: 'Abcd!234',
    };

    const result = await authService.register(registerData);
    
    // Check user properties but not exact ID since it's generated
    expect(result).toEqual(expect.objectContaining({
        name: 'New User3',
        email: registerData.email,
        role: 'user',
    }));
    
    // Verify membership ID format but not exact value
    expect(result.membershipId).toBeDefined();
    expect(typeof result.membershipId).toBe('string');
    expect(result.membershipId).toMatch(/^LIB\d+$/);
    
    // Check that token exists and is a JWT (starts with eyJ)
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.token).toMatch(/^eyJ/);
    
    // Check localStorage has token (without checking exact value)
    const storedToken = localStorageMock.getItem('token');
    expect(storedToken).toBeDefined();
    expect(storedToken).toBe(result.token);
    
    // Check user data in localStorage
    const storedUser = JSON.parse(localStorageMock.getItem('user') || '{}');
    expect(storedUser).toEqual(expect.objectContaining({
        name: 'New User3',
        email: registerData.email,
        role: 'user'
    }));
});

  it('should logout a user', () => {
    // Setup: first login a user
    localStorageMock.setItem('token', 'fake-token-123');
    localStorageMock.setItem('user', JSON.stringify({
      _id: '68a80d33727d8b0ae88cd4fe',
      name: 'Admin User',
      email: 'admin@library.com'
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
      _id: '68a80d33727d8b0ae88cd4fe',
      name: 'Admin User',
      email: 'admin@library.com',
      role: 'admin'
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
