import React from 'react';
import { 
  Home, 
  Plus, 
  History, 
  Users, 
  Building, 
  BarChart3, 
  Settings,
  Heart,
  Package,
  CheckCircle
} from 'lucide-react';

interface SidebarProps {
  userRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, activeTab, onTabChange, isOpen }) => {
  const getMenuItems = () => {
    switch (userRole) {
      case 'donor':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'new-donation', label: 'New Donation', icon: Plus },
          { id: 'my-donations', label: 'My Donations', icon: History },
          { id: 'chat', label: 'AI Assistant', icon: Heart },
          { id: 'profile', label: 'Profile', icon: Settings },
        ];
      case 'partner':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'bulk-donation', label: 'Bulk Donation', icon: Package },
          { id: 'donations', label: 'Donations', icon: History },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'profile', label: 'Profile', icon: Settings },
        ];
      case 'beneficiary':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'available-food', label: 'Available Food', icon: Package },
          { id: 'requests', label: 'My Requests', icon: History },
          { id: 'profile', label: 'Profile', icon: Settings },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'donations', label: 'Review Donations', icon: CheckCircle },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'organizations', label: 'Organizations', icon: Building },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:inset-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-200
                    ${isActive 
                      ? 'bg-emerald-100 text-emerald-900 border-r-2 border-emerald-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                    ${isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};