import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import StoreSidebar from './StoreSidebar';
import StoreHeader from './StoreHeader';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { fetchMyStore } from '../../store/slices/storeSlice';

const StoreLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { myStore } = useAppSelector((state) => state.stores);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'store_admin') {
      navigate('/store-admin/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch store info when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.role === 'store_admin') {
      dispatch(fetchMyStore());
    }
  }, [isAuthenticated, user, dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/store-admin/login');
  };

  if (!isAuthenticated || user?.role !== 'store_admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        storeName={myStore?.name || 'My Store'}
        onLogout={handleLogout}
      />
      <div className="lg:pl-64">
        <StoreHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StoreLayout;