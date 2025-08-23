import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import socketService from '../services/socketService';

// Simple notification type for this component
interface SimpleNotification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}

const NotificationIndicator = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Fetch recent unread notifications
    const fetchNotifications = async () => {
      try {
        // Use the user ID from the token
        const userId = user.id;
        const response = await notificationService.getUserNotifications(
          userId,
          1,
          5,
          true // unread only
        );
        
        // Convert to our simple notification type
        const simpleNotifications = (response.items || []).map((item: any) => ({
          _id: item._id,
          message: item.message,
          isRead: item.isRead,
          createdAt: item.createdAt,
          type: item.type
        }));
        
        setNotifications(simpleNotifications);
        setUnreadCount(response.total || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    
    // Set up socket for real-time notifications
    const removeListener = socketService.onNotification((notification: any) => {
      const userId = user.id;
      if (notification.userId === userId) {
        const newNotification: SimpleNotification = {
          _id: notification._id,
          message: notification.message,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          type: notification.type
        };
        
        // Add to our local state
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
        setUnreadCount(prev => prev + 1);
      }
    });
    
    return () => {
      removeListener();
    };
  }, [user]);
  
  // No need to show anything if user isn't logged in
  if (!user) return null;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'due_date_reminder':
        return <span className="text-blue-500">🕒</span>;
      case 'overdue':
        return <span className="text-red-500">⚠️</span>;
      case 'book_available':
        return <span className="text-green-500">✅</span>;
      case 'return_confirmation':
        return <span className="text-purple-500">📚</span>;
      default:
        return <span className="text-gray-500">📢</span>;
    }
  };
  
  const markAsRead = async (id: string) => {
    try {
      await notificationService.markNotificationAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-1 text-gray-700 hover:bg-gray-100 rounded-full dark:text-gray-300 dark:hover:bg-gray-700"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg dark:bg-gray-800 z-50">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
              <Link
                to="/notifications"
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                onClick={() => setShowDropdown(false)}
              >
                View All
              </Link>
            </div>
          </div>
          
          <div className="max-h-72 overflow-y-auto">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map(notification => (
                  <li key={notification._id} className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                <p>No new notifications</p>
              </div>
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link
              to="/notifications"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
              onClick={() => setShowDropdown(false)}
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationIndicator;
