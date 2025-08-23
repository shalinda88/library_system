import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import socketService from '../services/socketService';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Connect socket when user is already logged in (e.g., on page refresh)
  useEffect(() => {
    if (user) {
      const token = authService.getToken();
      if (token) {
        socketService.connect(token);
        console.log('Socket reconnected with existing user session');
      }
    }
    
    // Disconnect socket on component unmount
    return () => {
      if (user) {
        socketService.disconnect();
        console.log('Socket disconnected on AuthProvider unmount');
      }
    };
  }, [user]);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      setUser(response);
      
      // Connect to socket server with user token
      socketService.connect(authService.getToken() || '');
      console.log('Socket connected after login');
      
      // Navigate to previous page or dashboard
      const origin = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(origin);
    } catch (err: any) {
      // Extract the most meaningful error message
      let errorMessage = 'Login failed. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Pass confirmPassword to the backend for validation
      const response = await authService.register({ name, email, password, confirmPassword });
      setUser(response);
      
      // Connect to socket server with user token
      socketService.connect(authService.getToken() || '');
      console.log('Socket connected after registration');
      
      navigate('/dashboard');
    } catch (err: any) {
      // Extract the most meaningful error message
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (data: Partial<AuthUser>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser((prev: AuthUser | null) => prev ? { ...prev, ...updatedUser } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
      console.error('Update profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Disconnect socket before logout
    socketService.disconnect();
    console.log('Socket disconnected on logout');
    
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
