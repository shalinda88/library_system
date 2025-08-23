import request from 'supertest';
import { setupTestApp } from '../setup/test-app.js';
import healthRoutes from '../../src/routes/healthRoutes.js';

describe('Health Routes', () => {
  const app = setupTestApp();
  
  // Register the health routes for testing
  app.use('/api/health', healthRoutes);

  it('should return 200 status and health information', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message', 'Library System API is running');
    expect(response.body).toHaveProperty('timestamp');
  });
});
