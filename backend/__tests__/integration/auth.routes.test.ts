import supertest from 'supertest';
import '../setup/db-setup.js';
import { setupTestApp } from '../setup/test-app.js';
import User, { UserRole } from '../../src/models/User.js';

const app = setupTestApp();
const request = supertest(app);

describe('Auth Integration Tests', () => {
  const testUser = {
    name: 'Integration Test User',
    email: 'integration@example.com',
    password: 'Password123',
  };

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(testUser.name);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body).toHaveProperty('membershipId');
    });

    it('should not register a user with an existing email', async () => {
      // Create a user first
      await User.create({
        ...testUser,
        membershipId: 'MEM12345'
      });

      // Try to register with the same email
      const response = await request
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await User.create({
        ...testUser,
        membershipId: 'MEM12345'
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe(testUser.email);
    });

    it('should not login with invalid password', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should not login with non-existent email', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });
});
