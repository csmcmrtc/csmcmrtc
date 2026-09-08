import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  Store,
  IndianRupee,
  ArrowUpRight,
//   ArrowDownRight
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import adminService from '../../services/adminService';
import type { DashboardStats, RecentOrder, RecentUser } from '../../services/adminService';
import { toast } from 'react-toastify';
// import LineChart from '../components/Charts/LineChart';
// import BarChart from '../components/Charts/BarChart';

interface DisplayStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalStores: number;
  totalRevenue: number;
  avgSavings: number;
  userGrowth: number;
  revenueGrowth: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DisplayStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [statsResponse, ordersResponse, usersResponse] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentOrders(5),
          adminService.getRecentUsers(5)
        ]);

        if (statsResponse.success) {
          const apiStats: DashboardStats = statsResponse.data;
          // Map API response to display format
          setStats({
            totalUsers: apiStats.users.total,
            totalProducts: apiStats.products.total,
            totalOrders: apiStats.orders.total,
            totalStores: apiStats.stores.total,
            totalRevenue: apiStats.totalRevenue,
            avgSavings: 0, // Calculate if needed
            userGrowth: 0, // Calculate if needed
            revenueGrowth: 0 // Calculate if needed
          });
        }

        if (ordersResponse.success) {
          setRecentOrders(ordersResponse.data);
        }

        if (usersResponse.success) {
          setRecentUsers(usersResponse.data);
        }
      } catch (error: any) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="border border-gray-300 cursor-pointer rounded-lg px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-blue-100 outline-none">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers.toLocaleString() || '0'}
          icon={<Users className="w-6 h-6" />}
          change={stats?.userGrowth || 0}
          changeType={stats && stats.userGrowth > 0 ? 'positive' : 'negative'}
          color="blue"
        />
        
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts.toLocaleString() || '0'}
          icon={<Package className="w-6 h-6" />}
          change={8.1}
          changeType="positive"
          color="green"
        />
        
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders.toLocaleString() || '0'}
          icon={<ShoppingCart className="w-6 h-6" />}
          change={15.3}
          changeType="positive"
          color="purple"
        />
        
        <StatsCard
          title="Partner Stores"
          value={stats?.totalStores.toLocaleString() || '0'}
          icon={<Store className="w-6 h-6" />}
          change={4.2}
          changeType="positive"
          color="orange"
        />
      </div>

      {/* Revenue & Savings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
              <p className="text-sm text-gray-600">Platform commission & fees</p>
            </div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ₹{(stats?.totalRevenue || 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{stats?.revenueGrowth}% from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Average User Savings</h3>
              <p className="text-sm text-gray-600">Per transaction</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ₹{stats?.avgSavings || 0}
              </div>
              <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                <ArrowUpRight className="w-4 h-4" />
                <span>+5.2% from last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {/* <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <LineChart />
        </div> */}

        {/* Popular Categories */}
        {/* <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Popular Categories</h3>
          </div>
          <BarChart />
        </div> */}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <div>
                    <div className="font-semibold text-gray-900">{order.order_number}</div>
                    <div className="text-sm text-gray-600">{order.user?.name || 'Unknown User'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">₹{order.total_amount}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No recent orders</div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-4">
            {recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                    }`}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        user.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'store_admin' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No recent users</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;