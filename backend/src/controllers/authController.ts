import { Request, Response } from 'express';
import User, { IUser, UserRole } from '../models/User.js';
import { generateMembershipId } from '../utils/index.js';
import { generateToken } from '../utils/jwt.js';

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Only allow admin and librarian to be created by admins
    if ((role === UserRole.ADMIN || role === UserRole.LIBRARIAN) && 
        (!req.user || req.user.role !== UserRole.ADMIN)) {
      res.status(403).json({ message: 'Unauthorized to create this user type' });
      return;
    }

    // Generate a unique membership ID
    const membershipId = generateMembershipId();

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || UserRole.USER,
      membershipId
    });

    if (user) {
      // Generate token
      const token = generateToken(user._id?.toString() || '');

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipId: user.membershipId,
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ 
        message: 'Request body is missing', 
        help: 'Make sure to send a JSON body with email and password, and set Content-Type header to application/json'
      });
      return;
    }
    
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({ message: 'Account is inactive' });
      return;
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken(user._id?.toString() || '');

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      membershipId: user.membershipId,
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by auth middleware
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      membershipId: user.membershipId,
      borrowingLimit: user.borrowingLimit,
      borrowedBooks: user.borrowedBooks,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by auth middleware
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { name, email, profilePicture } = req.body;

    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;

    // Save changes
    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by auth middleware
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
