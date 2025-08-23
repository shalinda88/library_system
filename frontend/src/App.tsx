import { 
  Route, 
  createBrowserRouter, 
  createRoutesFromElements, 
  RouterProvider,
  Navigate
} from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LibrarianRoute from './components/LibrarianRoute';
import Layout from './components/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import NotificationToaster from './components/NotificationToaster';
import SocketInitializer from './components/SocketInitializer';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const BooksPage = lazy(() => import('./pages/BooksPage'));
const BookDetailsPage = lazy(() => import('./pages/BookDetailsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BorrowingsPage = lazy(() => import('./pages/BorrowingsPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const ManageBooksPage = lazy(() => import('./pages/ManageBooksPage'));
const ManageUsersPage = lazy(() => import('./pages/ManageUsersPage'));
const ManageBorrowingsPage = lazy(() => import('./pages/ManageBorrowingsPage'));
const BookFormPage = lazy(() => import('./pages/BookFormPage'));
const BorrowingFormPage = lazy(() => import('./pages/BorrowingFormPage'));
const BorrowingDetailsPage = lazy(() => import('./pages/BorrowingDetailsPage'));
// User management pages
const UserFormPage = lazy(() => import('./pages/UserFormPage'));
const UserDetailsPage = lazy(() => import('./pages/UserDetailsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AdminNotificationsPage = lazy(() => import('./pages/AdminNotificationsPage'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route 
      element={
        <AuthProvider>
          <>
            <SocketInitializer />
            <NotificationToaster />
            <Layout />
          </>
        </AuthProvider>
      }
      path="/"
    >
      {/* Public Routes */}
      <Route 
        index 
        element={
          <Suspense fallback={<LoadingSpinner />}>
            {/* Redirect to dashboard if logged in, otherwise show homepage */}
            {localStorage.getItem('user') ? <Navigate to="/dashboard" replace /> : <HomePage />}
          </Suspense>
        } 
      />
      <Route 
        path="login" 
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <LoginPage />
          </Suspense>
        } 
      />
      <Route 
        path="register" 
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <RegisterPage />
          </Suspense>
        } 
      />
      <Route 
        path="books" 
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <BooksPage />
          </Suspense>
        } 
      />
      <Route 
        path="books/:id" 
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <BookDetailsPage />
          </Suspense>
        } 
      />

      {/* Protected Routes (Any logged-in user) */}
      <Route element={<ProtectedRoute />}>
        <Route 
          path="dashboard" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          } 
        />
        <Route 
          path="profile" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProfilePage />
            </Suspense>
          } 
        />
        <Route 
          path="borrowings" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <BorrowingsPage />
            </Suspense>
          } 
        />
        <Route 
          path="notifications" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <NotificationsPage />
            </Suspense>
          } 
        />
      </Route>

      {/* Librarian and Admin Routes */}
      <Route element={<LibrarianRoute />}>
        <Route 
          path="manage/books" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ManageBooksPage />
            </Suspense>
          } 
        />
        <Route 
          path="manage/books/create" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <BookFormPage />
            </Suspense>
          } 
        />
        <Route 
          path="manage/books/edit/:id" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <BookFormPage />
            </Suspense>
          } 
        />
        <Route 
          path="manage/borrowings" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ManageBorrowingsPage />
            </Suspense>
          } 
        />
        <Route 
          path="manage/borrowings/create" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <BorrowingFormPage />
            </Suspense>
          } 
        />
        <Route 
          path="manage/borrowings/:id" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <BorrowingDetailsPage />
            </Suspense>
          } 
        />
        <Route 
          path="reports" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              {/* <ReportsPage /> */}
            </Suspense>
          } 
        />
      </Route>

      {/* Admin Only Routes */}
      <Route element={<AdminRoute />}>
        <Route 
          path="admin/dashboard" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminDashboardPage />
            </Suspense>
          } 
        />
        <Route 
          path="admin/notifications" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminNotificationsPage />
            </Suspense>
          } 
        />
     
        <Route 
          path="manage/users" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ManageUsersPage />
            </Suspense>
          } 
        />
        <Route 
          path="manage/users/create" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <UserFormPage />
            </Suspense>
          } 
        />
        <Route 
          path="manage/users/edit/:id" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <UserFormPage />
            </Suspense>
          } 
        />
        <Route 
          path="manage/users/:id" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <UserDetailsPage />
            </Suspense>
          } 
        />
      </Route>

      {/* 404 Route */}
      <Route 
        path="*" 
        element={
          <Suspense fallback={<LoadingSpinner />}>
            {/* <NotFoundPage /> */}
          </Suspense>
        } 
      />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />
}

export default App
