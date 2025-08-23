import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';
import authService from '../services/authService';

/**
 * Component that initializes and manages socket connections.
 * This ensures sockets are connected whenever the user is logged in.
 */
const SocketInitializer = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      // Disconnect if not logged in
      socketService.disconnect();
      return;
    }
    
    // Get token and connect
    const token = authService.getToken();
    if (token) {
      // Only connect if we're not already connected
      socketService.connect(token);
      
      // Join the user's own room to receive notifications
      socketService.joinUserRoom(user.id);
      
      console.log('Socket initialized/reconnected in SocketInitializer');
    }
    
    return () => {
      // No need to disconnect on unmount, as the socket should persist
      // throughout the application lifetime while logged in
    };
  }, [user]);
  
  // This component doesn't render anything
  return null;
};

export default SocketInitializer;
