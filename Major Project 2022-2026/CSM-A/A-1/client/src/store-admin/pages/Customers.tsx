import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  MoreVertical,
  Star,
  Award,
  UserPlus,
  Send,
  Gift,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Heart,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import storeService from '../../services/storeService';

interface Customer {
  id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  store_id: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  first_order_date: string;
  created_at: string;
  // Computed/UI fields
  status?: 'active' | 'inactive' | 'blocked';
  tier?: 'regular' | 'silver' | 'gold' | 'platinum';
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  averageLifetimeValue: number;
  repeatCustomerRate: number;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await storeService.getMyStoreCustomers({
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        // Add computed fields for UI
        const customersWithTiers = (response.data.customers || []).map((customer: Customer) => ({
          ...customer,
          status: getCustomerStatus(customer),
          tier: getCustomerTier(customer.total_spent || 0)
        }));
        setCustomers(customersWithTiers);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0
        }));
      }
    } catch (err: any) {
      console.error('Failed to fetch customers:', err);
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Calculate customer tier based on total spent
  const getCustomerTier = (totalSpent: number): 'regular' | 'silver' | 'gold' | 'platinum' => {
    if (totalSpent >= 50000) return 'platinum';
    if (totalSpent >= 25000) return 'gold';
    if (totalSpent >= 10000) return 'silver';
    return 'regular';
  };

  // Calculate customer status based on last order date
  const getCustomerStatus = (customer: Customer): 'active' | 'inactive' | 'blocked' => {
    if (!customer.last_order_date) return 'inactive';
    const lastOrder = new Date(customer.last_order_date);
    const daysSinceLastOrder = Math.floor((Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastOrder <= 30 ? 'active' : 'inactive';
  };

  // Calculate stats from current data
  const stats: CustomerStats = {
    totalCustomers: pagination.total || customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    newThisMonth: customers.filter(c => {
      const joinDate = new Date(c.first_order_date || c.created_at);
      const thisMonth = new Date();
      return joinDate.getMonth() === thisMonth.getMonth() && joinDate.getFullYear() === thisMonth.getFullYear();
    }).length,
    averageLifetimeValue: customers.length > 0 
      ? Math.round(customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / customers.length)
      : 0,
    repeatCustomerRate: customers.length > 0
      ? Math.round((customers.filter(c => (c.total_orders || 0) > 1).length / customers.length) * 100)
      : 0
  };

  const getTierColor = (tier: Customer['tier']) => {
    switch (tier) {
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'silver':
        return 'bg-gray-200 text-gray-800';
      case 'regular':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: Customer['tier']) => {
    switch (tier) {
      case 'platinum':
      case 'gold':
        return <Award className="h-3 w-3" />;
      case 'silver':
        return <Star className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'inactive':
        return <Clock className="h-4 w-4" />;
      case 'blocked':
        return <Ban className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      customer.user?.name?.toLowerCase().includes(term) ||
      customer.user?.email?.toLowerCase().includes(term) ||
      customer.user?.phone?.includes(term)
    );
  }).filter(customer => {
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesTier = tierFilter === 'all' || customer.tier === tierFilter;
    return matchesStatus && matchesTier;
  });

  const updateCustomerStatus = (customerId: string, newStatus: 'active' | 'inactive' | 'blocked') => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.id === customerId ? { ...customer, status: newStatus } : customer
      )
    );
    setShowActionMenu(null);
  };

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const openMessageModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowMessageModal(true);
    setMessageText('');
  };

  const handleSendMessage = () => {
    if (!selectedCustomer || !messageText.trim()) return;

    console.log(`Sending message to ${selectedCustomer.user?.name || 'Customer'}:`, messageText);

    setShowMessageModal(false);
    setSelectedCustomer(null);
    setMessageText('');
  };

  // Loading state
  if (loading && customers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && customers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mt-8">
          <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to load customers</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCustomers}
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
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer base and relationships</p>
        </div>
        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</h3>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{stats.newThisMonth} this month
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeCustomers}</h3>
              <p className="text-sm text-gray-500 mt-2">
                {Math.round((stats.activeCustomers / stats.totalCustomers) * 100)}% of total
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Lifetime Value</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.averageLifetimeValue.toLocaleString()}</h3>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Repeat Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.repeatCustomerRate}%</h3>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +3% this quarter
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Tiers Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">Platinum</span>
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {customers.filter(c => c.tier === 'platinum').length}
            </p>
            <p className="text-xs text-purple-700 mt-1">₹50,000+ lifetime value</p>
          </div>

          <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-900">Gold</span>
              <Award className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {customers.filter(c => c.tier === 'gold').length}
            </p>
            <p className="text-xs text-yellow-700 mt-1">₹25,000+ lifetime value</p>
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Silver</span>
              <Star className="h-5 w-5 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {customers.filter(c => c.tier === 'silver').length}
            </p>
            <p className="text-xs text-gray-700 mt-1">₹10,000+ lifetime value</p>
          </div>

          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Regular</span>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {customers.filter(c => c.tier === 'regular').length}
            </p>
            <p className="text-xs text-blue-700 mt-1">New customers</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="regular">Regular</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
              <Filter className="h-4 w-4" />
              More Filters
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors cursor-pointer">
              <UserPlus className="h-4 w-4" />
              Add Customer
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full h-10 w-10 flex items-center justify-center text-white font-semibold">
                        {(customer.user?.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{customer.user?.name || 'Customer'}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Member since {new Date(customer.first_order_date || customer.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <p className="text-gray-900 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {customer.user?.email || '-'}
                      </p>
                      <p className="text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {customer.user?.phone || '-'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(customer.tier || 'regular')}`}>
                      {getTierIcon(customer.tier || 'regular')}
                      <span className="ml-1 capitalize">{customer.tier || 'regular'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm">
                      <ShoppingBag className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{customer.total_orders || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">₹{(customer.total_spent || 0).toLocaleString('en-IN')}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">₹{customer.total_orders > 0 ? Math.round((customer.total_spent || 0) / customer.total_orders).toLocaleString('en-IN') : 0}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">
                      {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      }) : '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status || 'inactive')}`}>
                      {getStatusIcon(customer.status || 'inactive')}
                      <span className="ml-1 capitalize">{customer.status || 'inactive'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewCustomerDetails(customer)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openMessageModal(customer)}
                        className="text-green-600 hover:text-green-800 cursor-pointer"
                        title="Send message"
                      >
                        <Mail className="h-4 w-4" />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === customer.id ? null : customer.id)}
                          className="text-gray-600 hover:text-gray-800 cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {showActionMenu === customer.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={() => viewCustomerDetails(customer)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Profile
                            </button>
                            <button
                              onClick={() => openMessageModal(customer)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                            >
                              <Send className="h-4 w-4" />
                              Send Message
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                              <Gift className="h-4 w-4" />
                              Send Offer
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                              <Edit className="h-4 w-4" />
                              Edit Details
                            </button>
                            <div className="border-t border-gray-200"></div>
                            {customer.status === 'active' ? (
                              <button
                                onClick={() => updateCustomerStatus(customer.id, 'blocked')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-red-600"
                              >
                                <Ban className="h-4 w-4" />
                                Block Customer
                              </button>
                            ) : (
                              <button
                                onClick={() => updateCustomerStatus(customer.id, 'active')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-green-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Activate Customer
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || tierFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first customer'}
            </p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCustomerModal(false);
              setSelectedCustomer(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full h-16 w-16 flex items-center justify-center text-white font-semibold text-2xl">
                    {(selectedCustomer.user?.name || 'C').charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-semibold text-gray-900">{selectedCustomer.user?.name || 'Customer'}</h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(selectedCustomer.tier)}`}>
                        {getTierIcon(selectedCustomer.tier)}
                        <span className="ml-1 capitalize">{selectedCustomer.tier}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Customer ID: {selectedCustomer.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-900 font-medium">Total Orders</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{selectedCustomer.total_orders || 0}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-900 font-medium">Total Spent</p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">₹{(selectedCustomer.total_spent || 0).toLocaleString()}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    <p className="text-sm text-purple-900 font-medium">Avg Order</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">₹{selectedCustomer.total_orders ? Math.round(selectedCustomer.total_spent / selectedCustomer.total_orders).toLocaleString() : 0}</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm text-yellow-900 font-medium">Favorites</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">0</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-sm font-medium text-gray-900">{selectedCustomer.user?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{selectedCustomer.user?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Account Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedCustomer.status)}`}>
                        {getStatusIcon(selectedCustomer.status)}
                        <span className="ml-1 capitalize">{selectedCustomer.status}</span>
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">First Order</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {selectedCustomer.first_order_date ? new Date(selectedCustomer.first_order_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Order</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {selectedCustomer.last_order_date ? new Date(selectedCustomer.last_order_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Orders</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">#ORD-2024-001</td>
                        <td className="px-4 py-3 text-sm text-gray-600">Jan 10, 2024</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">₹3,997</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Delivered
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">#ORD-2024-002</td>
                        <td className="px-4 py-3 text-sm text-gray-600">Jan 08, 2024</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">₹1,499</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Shipped
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors cursor-pointer">
                  <Ban className="h-4 w-4" />
                  Block Customer
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openMessageModal(selectedCustomer)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer">
                  <Gift className="h-4 w-4" />
                  Send Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMessageModal(false);
              setSelectedCustomer(null);
              setMessageText('');
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Send Message</h2>
                  <p className="text-sm text-gray-600 mt-1">To: {selectedCustomer.user?.name || 'Customer'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setSelectedCustomer(null);
                    setMessageText('');
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={8}
                  placeholder="Type your message here..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {messageText.length} / 1000 characters
                </p>
              </div>

              {/* Quick Templates */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Quick Templates</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setMessageText(`Hi ${selectedCustomer.user?.name || 'Customer'}, we have a special offer just for you! Check out our latest deals.`)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Promotional
                  </button>
                  <button
                    onClick={() => setMessageText(`Hi ${selectedCustomer.user?.name || 'Customer'}, thank you for being a valued customer! We appreciate your continued support.`)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Thank You
                  </button>
                  <button
                    onClick={() => setMessageText(`Hi ${selectedCustomer.user?.name || 'Customer'}, we noticed you haven't ordered in a while. We miss you! Here's a special discount code: WELCOME10`)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Re-engagement
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedCustomer(null);
                  setMessageText('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            Previous
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer">
            1
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            2
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            3
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customers;