import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';
import type { Notification } from '../types';

// Define how long to show toast notifications (in ms)
const TOAST_DURATION = 8000; // 8 seconds

const NotificationToaster = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up notification listener for user:', user.id);
    
    // Set up socket notification listener
    const removeListener = socketService.onNotification((notification: Notification) => {
      console.log('Received notification:', notification);
      
      // Show toast notification regardless of matching user ID
      // The server should already be sending only relevant notifications to this user's room
      toast.message('New Notification', {
        description: notification.message,
        duration: TOAST_DURATION,
        action: {
          label: 'View',
          onClick: () => window.location.href = '/notifications'
        }
      });
    });
    
    // Clean up listener on unmount
    return () => {
      console.log('Cleaning up notification listener');
      removeListener();
    };
  }, [user]);
  
  return (
    <Toaster 
      position="top-right"
      richColors
      closeButton
      theme="light"
      toastOptions={{
        style: { 
          background: 'white',
          border: '1px solid #E2E8F0',
          color: '#1A202C'
        }
      }} 
    />
  );
};

export default NotificationToaster;
