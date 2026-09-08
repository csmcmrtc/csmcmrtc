import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getProfile } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';

// Public components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import AuthModal from './components/Auth/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer, Flip } from 'react-toastify';

// Lazy load admin components
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const Dashboard = lazy(() => import('./admin/pages/Dashboard'));
const Products = lazy(() => import('./admin/pages/Products'));
const Stores = lazy(() => import('./admin/pages/Stores'));
const Orders = lazy(() => import('./admin/pages/Orders'));
const Users = lazy(() => import('./admin/pages/Users'));
const Settings = lazy(() => import('./admin/pages/Settings'));

// Lazy load store admin components
const StoreLayout = lazy(() => import('./store-admin/components/Layout'));
const StoreLogin = lazy(() => import('./store-admin/pages/StoreLogin'));
const StoreDashboard = lazy(() => import('./store-admin/pages/Dashboard'));
const StoreProducts = lazy(() => import('./store-admin/pages/Products'));
const StoreOrders = lazy(() => import('./store-admin/pages/Orders'));
const StoreInventory = lazy(() => import('./store-admin/pages/Inventory'));
const StoreReviews = lazy(() => import('./store-admin/pages/Reviews'));
const StoreCustomers = lazy(() => import('./store-admin/pages/Customers'));
const StoreSettings = lazy(() => import('./store-admin/pages/Settings'));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
  </div>
);

// Auth Modal State Context
interface AuthModalContextType {
  openAuth: boolean;
  setOpenAuth: React.Dispatch<React.SetStateAction<boolean>>;
  authOption: 'login' | 'signup';
  setAuthOption: React.Dispatch<React.SetStateAction<'login' | 'signup'>>;
}

export const AuthModalContext = React.createContext<AuthModalContextType>({
  openAuth: false,
  setOpenAuth: () => {},
  authOption: 'signup',
  setAuthOption: () => {},
});

// Inner App component that uses Redux hooks
const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [openAuth, setOpenAuth] = React.useState(false);
  const [authOption, setAuthOption] = React.useState<'login' | 'signup'>('signup');

  // Load user profile and cart on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  // Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <AuthModalContext.Provider value={{ openAuth, setOpenAuth, authOption, setAuthOption }}>
      <Router>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Flip}
        />
        <div className="min-h-screen relative">
          {/* Global gradient background */}
          <div className="fixed top-0 left-0 z-[-2] h-screen w-screen rotate-180 transform bg-white bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(252,205,238,.5)_100%)]"></div>

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <>
                <Navbar />
                <Home />
              </>
            } />
            <Route path="/search" element={
              <>
                <Navbar />
                <Search />
              </>
            } />
            <Route path="/payment" element={
              <>
                <Navbar />
                <Payment />
              </>
            } />
            <Route path="/payment-success" element={
              <>
                <Navbar />
                <PaymentSuccess />
              </>
            } />

            {/* Admin Login (Public) */}
            <Route path="/admin/login" element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminLogin />
              </Suspense>
            } />

            {/* Admin Routes (Protected - Admin only) */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminLayout />
                </Suspense>
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="stores" element={<Stores />} />
              <Route path="orders" element={<Orders />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Store Admin Login (Public) */}
            <Route path="/store-admin/login" element={
              <Suspense fallback={<LoadingSpinner />}>
                <StoreLogin />
              </Suspense>
            } />

            {/* Store Admin Routes (Protected - Store Admin only) */}
            <Route path="/store-admin" element={
              <ProtectedRoute allowedRoles={['store_admin']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <StoreLayout />
                </Suspense>
              </ProtectedRoute>
            }>
              <Route index element={<StoreDashboard />} />
              <Route path="products" element={<StoreProducts />} />
              <Route path="orders" element={<StoreOrders />} />
              <Route path="inventory" element={<StoreInventory />} />
              <Route path="reviews" element={<StoreReviews />} />
              <Route path="customers" element={<StoreCustomers />} />
              <Route path="settings" element={<StoreSettings />} />
            </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-6">Page Not Found</p>
                <div className="space-y-2">
                  <div>
                    <a
                      href="/"
                      className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors inline-block mr-4"
                    >
                      Go Home
                    </a>
                    <a
                        href="/admin"
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors inline-block mr-4"
                      >
                        Admin Panel
                      </a>
                      <a
                        href="/store-admin"
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors inline-block"
                      >
                        Store Admin
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            } />
          </Routes>

          {/* Auth Modal */}
          <AuthModal />
        </div>
      </Router>
    </AuthModalContext.Provider>
  );
};

// Main App with Provider
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;