// /src/store-admin/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Star,
  Eye,
  Clock,
  IndianRupee,
  Users,
  AlertCircle,
  CheckCircle,
  Truck,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import storeService from '../../services/storeService';

interface StoreStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    min_stock: number;
    category?: string;
  }>;
}

interface Order {
  id: string;
  order_number: string;
  user: { name: string };
  items: any[];
  total_amount: number;
  status: string;
  created_at: string;
}

const StoreDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [statsResponse, ordersResponse, storeResponse] = await Promise.all([
        storeService.getMyStoreStats(),
        storeService.getMyStoreOrders({ limit: 5 }),
        storeService.getMyStore()
      ]);

      if (statsResponse.success) {
        setStoreStats(statsResponse.data as unknown as StoreStats);
      }

      if (ordersResponse.success) {
        setRecentOrders(ordersResponse.data.orders || []);
      }

      if (storeResponse.success) {
        setStore(storeResponse.data.store);
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Build stats array from real data
  const stats = storeStats ? [
    {
      title: 'Total Revenue',
      value: `₹${storeStats.totalRevenue.toLocaleString('en-IN')}`,
      change: '',
      changeType: 'positive',
      icon: IndianRupee,
      color: 'green'
    },
    {
      title: 'Total Orders',
      value: storeStats.totalOrders.toString(),
      change: `${storeStats.pendingOrders} pending`,
      changeType: 'neutral',
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      title: 'Active Products',
      value: storeStats.totalProducts.toString(),
      change: `${storeStats.lowStockProducts?.length || 0} low stock`,
      changeType: storeStats.lowStockProducts?.length > 0 ? 'negative' : 'positive',
      icon: Package,
      color: 'purple'
    },
    {
      title: 'Store Rating',
      value: store?.rating?.toFixed(1) || 'N/A',
      change: `${store?.total_ratings || 0} reviews`,
      changeType: 'positive',
      icon: Star,
      color: 'yellow'
    }
  ] : [];

  const lowStockItems = storeStats?.lowStockProducts || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'preparing':
        return <Clock className="w-4 h-4" />;
      case 'ready':
        return <Package className="w-4 h-4" />;
      case 'delivered':
        return <Truck className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to load dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor your store performance and manage operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className={`flex items-center mt-2 text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change && (
                      <>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {stat.change}
                      </>
                    )}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'purple' ? 'bg-purple-100' :
                  'bg-yellow-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    'text-yellow-600'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <button className="text-green-600 hover:text-green-700 text-sm font-medium cursor-pointer">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No orders yet</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.user?.name || 'Customer'} • {order.items?.length || 0} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{parseFloat(order.total_amount?.toString() || '0').toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-500">{getTimeAgo(order.created_at)}</p>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                  <p>All items well stocked!</p>
                </div>
              ) : (
                lowStockItems.map((item, index) => (
                <div key={item.id || index} className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.category || 'Uncategorized'}</p>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      Low Stock
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Current: {item.stock}</span>
                    <span className="text-gray-600">Min: {item.min_stock}</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((item.stock / item.min_stock) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                ))
              )}
            </div>
            <button 
              onClick={() => navigate('/store-admin/inventory')}
              className="w-full mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium cursor-pointer"
            >
              Update Inventory
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, label: 'Add Product', color: 'blue', path: '/store-admin/products' },
            { icon: Eye, label: 'View Orders', color: 'green', path: '/store-admin/orders' },
            { icon: Star, label: 'Manage Reviews', color: 'yellow', path: '/store-admin/reviews' },
            { icon: Users, label: 'View Customers', color: 'purple', path: '/store-admin/customers' }
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                  action.color === 'blue' ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50' :
                  action.color === 'green' ? 'border-green-300 hover:border-green-400 hover:bg-green-50' :
                  action.color === 'yellow' ? 'border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50' :
                  'border-purple-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                <Icon className={`w-8 h-8 ${
                  action.color === 'blue' ? 'text-blue-600' :
                  action.color === 'green' ? 'text-green-600' :
                  action.color === 'yellow' ? 'text-yellow-600' :
                  'text-purple-600'
                }`} />
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;