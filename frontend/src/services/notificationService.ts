import api from './api';
import type { 
  Notification, 
  PaginationResult 
} from '../types';

// Notification service for interacting with notification API
export const notificationService = {
  // Get notifications for a user
  async getUserNotifications(
    userId: string, 
    page: number = 1, 
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<PaginationResult<Notification>> {
    const response = await api.get(`/notifications/user/${userId}`, {
      params: { page, limit, unreadOnly }
    });
    return response.data;
  },
  
  // Mark notification as read
  async markNotificationAsRead(id: string): Promise<{ message: string }> {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  
  // Mark all notifications as read
  async markAllNotificationsAsRead(userId: string): Promise<{ message: string }> {
    const response = await api.put(`/notifications/user/${userId}/read-all`);
    return response.data;
  },
  
  // Create a system notification (admin/librarian only)
  async createSystemNotification(data: {
    userId: string;
    message: string;
    relatedBookId?: string;
    relatedBorrowingId?: string;
  }): Promise<Notification> {
    const response = await api.post('/notifications', data);
    return response.data;
  },
  
  // Delete a notification
  async deleteNotification(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};

export default notificationService;
