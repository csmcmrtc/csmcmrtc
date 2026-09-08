// /src/store-admin/components/StoreHeader.tsx
import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  Search,
  User,
  // MapPin,
  Clock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import storeService from '../../services/storeService';

interface StoreHeaderProps {
  onMenuClick: () => void;
}

interface StoreInfo {
  name: string;
  address: string;
  openingHours: string;
  ownerName: string;
  isOpen: boolean;
}

const StoreHeader: React.FC<StoreHeaderProps> = ({ onMenuClick }) => {
  const [storeOpen, setStoreOpen] = useState(true);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: '',
    address: '',
    openingHours: '9:00 AM - 10:00 PM',
    ownerName: 'Store Owner',
    isOpen: true
  });

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await storeService.getMyStore();
        if (response.success && response.data.store) {
          const store = response.data.store;
          setStoreInfo({
            name: store.name || '',
            address: store.address || '',
            openingHours: formatOpeningHours(store.opening_hours),
            ownerName: store.owner?.name || 'Store Owner',
            isOpen: store.is_active !== false
          });
          setStoreOpen(store.is_active !== false);
        }
      } catch (error) {
        // Failed to fetch store info silently
      }
    };

    fetchStoreInfo();
  }, []);

  const formatOpeningHours = (hours: any): string => {
    if (!hours) return '9:00 AM - 10:00 PM';
    // Simple format - can be enhanced based on actual data structure
    if (typeof hours === 'string') return hours;
    if (hours.monday) {
      return `${hours.monday.open || '9:00'} - ${hours.monday.close || '21:00'}`;
    }
    return '9:00 AM - 10:00 PM';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Store Status Toggle - Mobile (compact) */}
            <button
              onClick={() => setStoreOpen(!storeOpen)}
              className={`md:hidden flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                storeOpen 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {storeOpen ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
              {storeOpen ? 'Open' : 'Closed'}
            </button>

            {/* Store Status Toggle - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Store Status:</span>
              <button
                onClick={() => setStoreOpen(!storeOpen)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  storeOpen 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {storeOpen ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                {storeOpen ? 'Open' : 'Closed'}
              </button>
            </div>

            {/* Store Info */}
            <div className="hidden lg:flex items-center gap-4 text-sm text-gray-600">
              { /* <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{storeInfo.address || 'Store Location'}</span>
              </div> */}
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{storeInfo.openingHours}</span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders, products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-80"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{storeInfo.ownerName}</p>
                <p className="text-xs text-gray-500">Store Owner</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;