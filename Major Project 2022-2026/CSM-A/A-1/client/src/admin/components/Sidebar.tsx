import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Store,
  ShoppingCart,
  Users,
  Settings,
  X,
  LogOut,
  LogIn
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: string; // User display name or email
  onLogin?: () => void; // Handler for login
  onLogout?: () => void; // Handler for logout
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  user,
  onLogin,
  onLogout 
}) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Store, label: 'Stores', path: '/admin/stores' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      // Default behavior - redirect to login page
      window.location.href = '/admin/login';
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      localStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
  };

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src="/JS_logo.jpg" alt="JS" className='w-10 h-10 rounded-full' />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">JustSearch</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation - Only show if authenticated */}
        {user.length > 0 && (
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-brand text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        {/* Authentication Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {user.length > 0 ? (
            /* Logout Button */
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          ) : (
            /* Login Button */
            <button 
              onClick={handleLogin}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span className="font-medium">Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;