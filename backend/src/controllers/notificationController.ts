import { Request, Response } from 'express';
import Notification, { INotification, NotificationType } from '../models/Notification.js';
import { isValidObjectId, paginate } from '../utils/index.js';

// Get notifications for a user
export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;
    
    // Validate ID
    if (!isValidObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    // Build query
    const query: Record<string, any> = { userId };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const result = await paginate<INotification>(
      Notification,
      query,
      {
        page: Number(page),
        limit: Number(limit),
        sort: { createdAt: -1 },
        populate: ['relatedBookId', 'relatedBorrowingId']
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

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid notification ID' });
      return;
    }
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    
    // Check if the notification belongs to the authenticated user
    if (req.user && notification.userId.toString() !== req.user._id?.toString()) {
      res.status(403).json({ message: 'Not authorized to access this notification' });
      return;
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Validate ID
    if (!isValidObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    // Check if the authenticated user is the same as the target user
    if (req.user && userId !== req.user._id?.toString()) {
      res.status(403).json({ message: 'Not authorized to update these notifications' });
      return;
    }
    
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a system notification
export const createSystemNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, message, relatedBookId, relatedBorrowingId } = req.body;
    
    // Validate ID
    if (!isValidObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    // Create notification
    const notification = await Notification.create({
      userId,
      type: NotificationType.SYSTEM,
      message,
      relatedBookId,
      relatedBorrowingId
    });
    
    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      // Emit to specific user if they are connected
      io.to(userId).emit('notification:receive', notification);
    }
    
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid notification ID' });
      return;
    }
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    
    // Check if the notification belongs to the authenticated user
    if (req.user && notification.userId.toString() !== req.user._id?.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this notification' });
      return;
    }
    
    await Notification.deleteOne({ _id: id });
    
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
