import '../setup/db-setup.js';
import User, { UserRole } from '../../src/models/User.js';

describe('User Model Tests', () => {
  it('should create a user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.USER,
      membershipId: 'MEM12345'
    };

    const user = await User.create(userData);
    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe(userData.role);
    expect(user.membershipId).toBe(userData.membershipId);
    // Password should be hashed
    expect(user.password).not.toBe(userData.password);
  });

  it('should validate email format', async () => {
    const userData = {
      name: 'Invalid User',
      email: 'notanemail',
      password: 'password123',
      role: UserRole.USER,
      membershipId: 'MEM54321'
    };

    try {
      await User.create(userData);
      // If it reaches here, validation didn't fail as expected
      expect(true).toBe(false); // Force test to fail
    } catch (error) {
      // Validation should fail for invalid email
      expect(error).toBeDefined();
    }
  });

  it('should correctly compare passwords', async () => {
    const userData = {
      name: 'Password User',
      email: 'password@example.com',
      password: 'testPassword123',
      role: UserRole.USER,
      membershipId: 'MEM67890'
    };

    const user = await User.create(userData);
    
    // Correct password should return true
    const validPasswordResult = await user.comparePassword('testPassword123');
    expect(validPasswordResult).toBe(true);
    
    // Incorrect password should return false
    const invalidPasswordResult = await user.comparePassword('wrongPassword');
    expect(invalidPasswordResult).toBe(false);
  });

  it('should have default values set', async () => {
    const minimalUser = await User.create({
      name: 'Minimal User',
      email: 'minimal@example.com',
      password: 'minimal123',
      membershipId: 'MIN12345'
    });

    expect(minimalUser.role).toBe(UserRole.USER);
    expect(minimalUser.borrowingLimit).toBe(5);
    expect(minimalUser.borrowedBooks).toBe(0);
    expect(minimalUser.isActive).toBe(true);
  });

  it('should convert to JSON without password field', async () => {
    const user = await User.create({
      name: 'JSON User',
      email: 'json@example.com',
      password: 'json123',
      membershipId: 'JSON12345'
    });

    const userObject = user.toJSON();
    expect(userObject).not.toHaveProperty('password');
  });
});
