import { Request, Response } from 'express';
import User, { IUser, UserRole } from '../models/User.js';
import { generateMembershipId, isValidObjectId, paginate } from '../utils/index.js';

// Get all users with pagination and filters
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      name, 
      email, 
      role,
      isActive
    } = req.query;
    
    // Build query
    const query: Record<string, any> = {};
    
    if (name) {
      query.name = { $regex: name as string, $options: 'i' };
    }
    
    if (email) {
      query.email = { $regex: email as string, $options: 'i' };
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isActive === 'true') {
      query.isActive = true;
    } else if (isActive === 'false') {
      query.isActive = false;
    }
    
    const result = await paginate<IUser>(
      User,
      query,
      {
        page: Number(page),
        limit: Number(limit),
        sort: { createdAt: -1 },
        select: '-password'
      }
    );
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a single user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a user (admin only)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const {
      name,
      email,
      role,
      borrowingLimit,
      isActive
    } = req.body;
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    
    // Role updates only by admin
    if (role && req.user && req.user.role === UserRole.ADMIN) {
      user.role = role;
    }
    
    if (borrowingLimit !== undefined) {
      user.borrowingLimit = borrowingLimit;
    }
    
    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    
    // Save changes
    const updatedUser = await user.save();
    
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      membershipId: updatedUser.membershipId,
      borrowingLimit: updatedUser.borrowingLimit,
      borrowedBooks: updatedUser.borrowedBooks,
      isActive: updatedUser.isActive
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a new user (admin only)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      borrowingLimit 
    } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }
    
    // Generate membership ID
    const membershipId = generateMembershipId();
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || UserRole.USER,
      membershipId,
      borrowingLimit: borrowingLimit || 5
    });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipId: user.membershipId,
        borrowingLimit: user.borrowingLimit
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

// Delete a user (admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    // Prevent deleting yourself
    if (req.user && id === req.user._id?.toString()) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Check for borrowed books before deletion
    if (user.borrowedBooks > 0) {
      res.status(400).json({ 
        message: 'Cannot delete user with borrowed books' 
      });
      return;
    }
    
    await User.deleteOne({ _id: id });
    
    res.status(200).json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
