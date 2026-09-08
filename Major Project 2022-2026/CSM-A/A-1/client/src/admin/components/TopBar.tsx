import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Shield,
  HelpCircle,
  ChevronDown,
  Maximize,
  Minimize
} from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Mock data - replace with real data
  const currentAdmin = {
    name: 'Admin User',
    email: 'admin@justsearch.com',
    avatar: null,
    role: 'Super Admin'
  };

  const notifications = [
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'Order #12345 from John Doe',
      time: '2 min ago',
      unread: true
    },
    {
      id: '2',
      type: 'store',
      title: 'New Store Registration',
      message: 'Fresh Foods Store wants to join',
      time: '15 min ago',
      unread: true
    },
    {
      id: '3',
      type: 'user',
      title: 'User Support Request',
      message: 'Payment issue reported',
      time: '1 hour ago',
      unread: false
    },
    {
      id: '4',
      type: 'system',
      title: 'System Update',
      message: 'Price sync completed successfully',
      time: '2 hours ago',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      
      // Navigate to relevant admin page based on search keywords
      if (query.includes('product')) {
        navigate(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
      } else if (query.includes('store') || query.includes('shop')) {
        navigate(`/admin/stores?search=${encodeURIComponent(searchQuery)}`);
      } else if (query.includes('order')) {
        navigate(`/admin/orders?search=${encodeURIComponent(searchQuery)}`);
      } else if (query.includes('user') || query.includes('customer')) {
        navigate(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
      } else {
        // Default: search in products
        navigate(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
      }
      
      setSearchQuery('');
    }
  };

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const handleLogout = () => {
    // Implement logout logic
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return '🛍️';
      case 'store': return '🏪';
      case 'user': return '👤';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  return (
    <header className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, stores, orders..."
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none transition-colors"
              />
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Full Screen Toggle */}
            <button
              onClick={handleFullScreen}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            >
              {isFullScreen ? (
                <Minimize className="w-4 h-4 text-gray-600" />
              ) : (
                <Maximize className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {/* Help */}
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Help & Documentation"
            >
              <HelpCircle className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                  
                  {/* Notifications Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <span className="text-sm text-gray-500">{unreadCount} unread</span>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View All */}
                  <div className="p-4 border-t border-gray-200">
                    <button className="w-full text-brand hover:text-blue-600 text-sm font-medium transition-colors">
                      View All Notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {currentAdmin.avatar ? (
                <img
                  src={currentAdmin.avatar}
                  alt={currentAdmin.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{currentAdmin.name}</p>
                <p className="text-xs text-gray-500">{currentAdmin.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                  
                  {/* Profile Info */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      {currentAdmin.avatar ? (
                        <img
                          src={currentAdmin.avatar}
                          alt={currentAdmin.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{currentAdmin.name}</p>
                        <p className="text-sm text-gray-500">{currentAdmin.email}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-1">
                          <Shield className="w-3 h-3" />
                          {currentAdmin.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left">
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left">
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left">
                      <HelpCircle className="w-4 h-4" />
                      <span>Help & Support</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-6 pb-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none transition-colors"
            />
          </div>
        </form>
      </div>
    </header>
  );
};

export default TopBar;