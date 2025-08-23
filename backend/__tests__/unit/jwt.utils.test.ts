import { generateToken, verifyToken } from '../../src/utils/jwt.js';

describe('JWT Utility Tests', () => {
  it('should generate a valid token with the given ID', () => {
    const userId = '12345';
    const token = generateToken(userId);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT has 3 parts separated by dots
  });
  
  it('should verify and decode a valid token', () => {
    const userId = '67890';
    const token = generateToken(userId);
    
    const decoded = verifyToken(token);
    expect(decoded).toBeDefined();
    expect(decoded?.id).toBe(userId);
  });
  
  it('should return null for an invalid token', () => {
    const invalidToken = 'invalid.token.string';
    const decoded = verifyToken(invalidToken);
    
    expect(decoded).toBeNull();
  });
  
  it('should generate different tokens for different IDs', () => {
    const userId1 = '111';
    const userId2 = '222';
    
    const token1 = generateToken(userId1);
    const token2 = generateToken(userId2);
    
    expect(token1).not.toBe(token2);
  });
  
  it('should decode the same ID from a generated token', () => {
    const userIds = ['abc123', '456def', '789ghi'];
    
    userIds.forEach(id => {
      const token = generateToken(id);
      const decoded = verifyToken(token);
      expect(decoded?.id).toBe(id);
    });
  });
});
