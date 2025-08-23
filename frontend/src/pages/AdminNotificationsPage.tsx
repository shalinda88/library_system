import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import userService from '../services/userService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Define a simple user type for our component
interface SimpleUser {
  _id: string;
  name: string;
  email: string;
}

const AdminNotificationsPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getUsers({});
        
        // Extract users from response and map to SimpleUser type
        const fetchedUsers = (response.items || []).map((u: any) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
        }));
        
        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      const response = await userService.getUsers({ name: searchTerm });
      
      // Extract users from response and map to SimpleUser type
      const fetchedUsers = (response.items || []).map((u: any) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
      }));
      
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user._id));
  };

  const deselectAllUsers = () => {
    setSelectedUsers([]);
  };

  const sendNotification = async () => {
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one recipient.');
      return;
    }

    try {
      setSending(true);
      setError(null);
      
      // Create system notifications for each selected user
      for (const userId of selectedUsers) {
        // Create notification in the database
        // The backend will automatically emit a socket event
        await notificationService.createSystemNotification({
          userId,
          message,
        });
      }
      
      // Clear the form
      setMessage('');
      setSelectedUsers([]);
      setSuccess(`Notification sent to ${selectedUsers.length} user(s)`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (err) {
      console.error('Error sending notification:', err);
      setError('Failed to send notification. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Check if user has admin or librarian role
  const isAdminOrLibrarian = 
    user && 
    (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'librarian');

  if (!isAdminOrLibrarian) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold text-red-600">
          You don't have permission to access this page.
        </h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Send Notifications</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Send notifications to users in the system
        </p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/20 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Message */}
        <div>
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Notification Message
            </h2>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message*
              </label>
              <textarea
                id="message"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter notification message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <button
              onClick={sendNotification}
              disabled={sending}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md ${
                sending ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {sending ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2">Sending...</span>
                </span>
              ) : (
                'Send Notification'
              )}
            </button>
          </motion.div>
        </div>
        
        {/* User Selection */}
        <div>
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Select Recipients
            </h2>
            
            {/* Search Bar */}
            <div className="mb-4 flex">
              <input
                type="text"
                placeholder="Search by name or email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={handleSearch}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r-md dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
              >
                Search
              </button>
            </div>
            
            {/* Select All / Deselect All */}
            <div className="mb-3 flex justify-between text-sm">
              <button 
                onClick={selectAllUsers}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Select All
              </button>
              <button 
                onClick={deselectAllUsers}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Deselect All
              </button>
            </div>
            
            {/* User List */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-md max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-20">
                  <LoadingSpinner />
                </div>
              ) : users.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <li key={user._id}>
                      <label className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleUserSelection(user._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-500 dark:bg-gray-600"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-800 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              )}
            </div>
            
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {selectedUsers.length} recipient(s) selected
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
