import jwt from 'jsonwebtoken';
import config from '../config/index.js';

interface TokenPayload {
  id: string;
}

/**
 * Generate a JWT token
 * @param id User ID to encode in the token
 * @returns JWT token string
 */
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, config.JWT_SECRET);
};

/**
 * Verify and decode JWT token
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};
