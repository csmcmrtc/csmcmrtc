import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Users,
  Star,
  Truck,
  X,
  LogOut,
  Store
} from 'lucide-react';

interface StoreSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
  onLogout?: () => void;
}

const StoreSidebar: React.FC<StoreSidebarProps> = ({ 
  isOpen, 
  onClose,
  storeName = 'My Store',
  onLogout 
}) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/store-admin' },
    { icon: Package, label: 'My Products', path: '/store-admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/store-admin/orders' },
    { icon: Truck, label: 'Inventory', path: '/store-admin/inventory' },
    { icon: Star, label: 'Reviews', path: '/store-admin/reviews' },
    { icon: Users, label: 'Customers', path: '/store-admin/customers' },
    { icon: Settings, label: 'Store Settings', path: '/store-admin/settings' },
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('storeToken');
      window.location.href = '/store-admin/login';
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
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{storeName}</h2>
              <p className="text-xs text-gray-500">Store Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/store-admin'} 
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default StoreSidebar;