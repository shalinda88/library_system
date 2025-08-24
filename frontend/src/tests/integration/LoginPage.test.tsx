import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { useAuth } from '../../contexts/AuthContext';
import LoginPage from '../../pages/LoginPage';

// Mock the useAuth hook and the AuthProvider
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    loading: false,
    error: null,
    clearError: vi.fn()
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}));

describe('LoginPage Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
  });

  it('should toggle password visibility when show/hide button is clicked', async () => {
    render(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // The button doesn't have a text label, so we need to select it differently
    const toggleButton = screen.getByRole('button', { name: '' });
    await userEvent.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should call the login function when form is submitted', async () => {
    const mockLogin = vi.fn();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      loading: false,
      error: null,
      clearError: vi.fn()
    });
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    await userEvent.click(submitButton);
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should display a loading spinner when loading state is true', () => {
    (useAuth as any).mockReturnValue({
      login: vi.fn(),
      loading: true,
      error: null,
      clearError: vi.fn()
    });
    
    render(<LoginPage />);
    
    // Look for the spinner by its class instead of role
    expect(screen.getByTestId('loading-spinner') || screen.getByText('.animate-spin')).toBeInTheDocument();
  });

  it('should display an error message when there is an error', () => {
    (useAuth as any).mockReturnValue({
      login: vi.fn(),
      loading: false,
      error: 'Invalid email or password',
      clearError: vi.fn()
    });
    
    render(<LoginPage />);
    
    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('should clear errors when trying to login again', async () => {
    const mockLogin = vi.fn();
    const mockClearError = vi.fn();
    
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      loading: false,
      error: 'Invalid email or password',
      clearError: mockClearError
    });
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    expect(mockClearError).toHaveBeenCalled();
  });
});
