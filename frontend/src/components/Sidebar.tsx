import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navLinkClasses = (isActive: boolean) => 
    `flex items-center p-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-primary-600 text-white' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;

  const sidebarVariants = {
    expanded: { width: '250px' },
    collapsed: { width: isMobile ? '0px' : '80px' }
  };

  if (!user) return null;

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}

      <motion.div
        className="h-full fixed top-0 left-0 pt-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 overflow-hidden"
        initial="collapsed"
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full flex flex-col justify-between">
          <div className="overflow-y-auto py-5 px-3">
            <button 
              onClick={toggleSidebar}
              className="absolute top-5 right-3 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {isCollapsed ? 
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                :
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              }
            </button>
            
            <ul className="space-y-2 mt-5">
              <li>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => navLinkClasses(isActive)}
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {!isCollapsed && <span>Dashboard</span>}
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/books" 
                  className={({ isActive }) => navLinkClasses(isActive)}
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {!isCollapsed && <span>Books</span>}
                </NavLink>
              </li>
              {/* <li>
                <NavLink 
                  to="/borrowings" 
                  className={({ isActive }) => navLinkClasses(isActive)}
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  {!isCollapsed && <span>Borrowings</span>}
                </NavLink>
              </li> */}

              <li>
                <NavLink 
                  to="/notifications" 
                  className={({ isActive }) => navLinkClasses(isActive)}
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {!isCollapsed && <span>Notifications</span>}
                </NavLink>
              </li>
      
              {/* Admin-only links */}
              {user.role?.toLowerCase() === 'admin' && (
                <>
                  <li className="pt-5">
                    {!isCollapsed && <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-3">Admin</div>}
                    <NavLink 
                      to="/admin/dashboard" 
                      className={({ isActive }) => navLinkClasses(isActive)}
                    >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {!isCollapsed && <span>Admin Dashboard</span>}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink 
                      to="/manage/users" 
                      className={({ isActive }) => navLinkClasses(isActive)}
                    >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {!isCollapsed && <span>Manage Users</span>}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink 
                      to="/admin/notifications" 
                      className={({ isActive }) => navLinkClasses(isActive)}
                    >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {!isCollapsed && <span>Send Notifications</span>}
                    </NavLink>
                  </li>
                </>
              )}

              {/* Librarian and Admin links */}
              {(user.role?.toLowerCase() === 'librarian' || user.role?.toLowerCase() === 'admin') && (
                <>
                  <li className="pt-5">
                    {!isCollapsed && <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-3">Management</div>}
                    <NavLink 
                      to="/manage/books" 
                      className={({ isActive }) => navLinkClasses(isActive)}
                    >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {!isCollapsed && <span>Manage Books</span>}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink 
                      to="/manage/borrowings" 
                      className={({ isActive }) => navLinkClasses(isActive)}
                    >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {!isCollapsed && <span>Manage Borrowings</span>}
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>

        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
