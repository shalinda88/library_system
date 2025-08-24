import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import type { UserRole } from '../types';
import NotificationIndicator from './NotificationIndicator';

  interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <Link to="/" className="flex items-center space-x-3">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span className="text-2xl font-bold ml-2">LibrarySystem</span>
          </motion.div>
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-200 transition-colors">Home</Link>
          <Link to="/books" className="hover:text-blue-200 transition-colors">Books</Link>
          
          {user ? (
            <>
              {/* <Link to="/borrowings" className="hover:text-blue-200 transition-colors">My Borrowings</Link> */}
              
              {(user.role === 'librarian' as UserRole || user.role === 'admin' as UserRole) && (
                <Link to="/manage/books" className="hover:text-blue-200 transition-colors">Manage Books</Link>
              )}
              
              {user.role === 'admin' as UserRole && (
                <Link to="/admin/dashboard" className="hover:text-blue-200 transition-colors">Admin</Link>
              )}
              
              {/* Notifications */}
              {/* <NotificationIndicator /> */}
              
              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-1 hover:text-blue-200 transition-colors">
                  <span>{user.name}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
             
                  <Link to="/notifications" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Notifications</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 transition-colors">Login</Link>
              <Link to="/register" className="bg-white text-blue-800 px-4 py-2 rounded hover:bg-blue-100 transition-colors">Register</Link>
            </>
          )}
        </nav>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.nav 
          className="lg:hidden bg-blue-900 px-4 py-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Link to="/" className="block py-2 hover:text-blue-200 transition-colors">Home</Link>
          <Link to="/books" className="block py-2 hover:text-blue-200 transition-colors">Books</Link>
          
          {user ? (
            <>
              {/* <Link to="/borrowings" className="block py-2 hover:text-blue-200 transition-colors">My Borrowings</Link> */}
              
              {(user.role === 'librarian' as UserRole || user.role === 'admin' as UserRole) && (
                <Link to="/manage/books" className="block py-2 hover:text-blue-200 transition-colors">Manage Books</Link>
              )}
              
              {user.role === 'admin' as UserRole && (
                <Link to="/admin/dashboard" className="block py-2 hover:text-blue-200 transition-colors">Admin</Link>
              )}
              
   
              <Link to="/notifications" className="block py-2 hover:text-blue-200 transition-colors">Notifications</Link>
              <button onClick={handleLogout} className="block py-2 text-left text-blue-200 hover:text-white w-full transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 hover:text-blue-200 transition-colors">Login</Link>
              <Link to="/register" className="block py-2 hover:text-blue-200 transition-colors">Register</Link>
            </>
          )}
        </motion.nav>
      )}
    </header>
  );
};

export default Header;
