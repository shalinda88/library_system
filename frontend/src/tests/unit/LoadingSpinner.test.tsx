import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />);
    const spinnerElement = document.querySelector('.animate-spin');
    expect(spinnerElement).toBeInTheDocument();
  });

  it('should render with small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinnerElement = document.querySelector('.h-5');
    expect(spinnerElement).toBeInTheDocument();
  });

  it('should render with large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinnerElement = document.querySelector('.h-12');
    expect(spinnerElement).toBeInTheDocument();
  });

  it('should render with secondary color', () => {
    render(<LoadingSpinner color="secondary" />);
    const spinnerElement = document.querySelector('.text-purple-600');
    expect(spinnerElement).toBeInTheDocument();
  });

  it('should render with white color', () => {
    render(<LoadingSpinner color="white" />);
    const spinnerElement = document.querySelector('.text-white');
    expect(spinnerElement).toBeInTheDocument();
  });
});
