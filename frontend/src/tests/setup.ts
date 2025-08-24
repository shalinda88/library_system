import '@testing-library/jest-dom';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock browser APIs not implemented in JSDOM
beforeAll(() => {
  // Mock window.scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: () => {},
    writable: true
  });
  
  // Mock window.scrollBy
  Object.defineProperty(window, 'scrollBy', {
    value: () => {},
    writable: true
  });
  
  // Mock Element.scrollIntoView
  Element.prototype.scrollIntoView = () => {};
  
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// runs a cleanup after each test case
afterEach(() => {
  cleanup();
});
