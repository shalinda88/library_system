import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { handlers } from './handlers';

// Setup requests interception using the given handlers
export const server = setupServer(...handlers);

// Reset any request handlers that may have been added during the tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
