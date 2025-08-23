import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import LoadingSpinner from './ui/LoadingSpinner';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Toggle sidebar on mobile menu button click
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when route changes (for mobile view)
  useEffect(() => {
    const closeSidebarOnRouteChange = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('popstate', closeSidebarOnRouteChange);
    return () => window.removeEventListener('popstate', closeSidebarOnRouteChange);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-grow">
        {/* Sidebar - only show if user is authenticated */}
        {user && <Sidebar />}
        
        <main className={`flex-grow px-4 py-8 lg:px-8 ${user ? 'md:ml-[80px]' : ''} transition-all duration-300`}>
          <div className="container mx-auto">
            <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}>
              {children || <Outlet />}
            </Suspense>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;
