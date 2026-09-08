import React, { useState, useEffect } from 'react';
import {
    Users as UsersIcon,
    Plus,
    Search,
    Download,
    Eye,
    Edit,
    Trash2,
    X,
    Ban,
    CheckCircle,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    ShoppingCart,
    IndianRupee,
    Star,
    Crown,
    Shield,
    Clock,
    Activity,
} from 'lucide-react';
import adminService, { type AdminUser } from '../../services/adminService';
import { toast } from 'react-toastify';

// Types
interface UserData {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string | null;
    role: 'customer' | 'admin' | 'store_owner';
    status: 'active' | 'inactive' | 'banned';
    isVerified: boolean;
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    stats: {
        totalOrders: number;
        totalSpent: number;
        avgOrderValue: number;
        totalSavings: number;
        lastOrderDate?: string;
    };
    preferences: {
        notifications: boolean;
        marketing: boolean;
        location: boolean;
    };
    createdAt: string;
    lastActiveAt: string;
}

const Users: React.FC = () => {
    // State Management
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'created' | 'orders' | 'spent'>('created');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Map API user to local format
    const mapApiUserToLocal = (apiUser: AdminUser): UserData => {
        return {
            id: apiUser.id,
            name: apiUser.name || 'Unknown',
            email: apiUser.email || '',
            phone: apiUser.phone || '',
            avatar: apiUser.avatar_url,
            role: apiUser.role === 'user' ? 'customer' : apiUser.role as UserData['role'],
            status: apiUser.is_active ? 'active' : 'inactive',
            isVerified: apiUser.email_verified || false,
            address: {
                street: '',
                city: '',
                state: '',
                pincode: ''
            },
            stats: {
                totalOrders: 0,
                totalSpent: 0,
                avgOrderValue: 0,
                totalSavings: 0
            },
            preferences: {
                notifications: true,
                marketing: false,
                location: false
            },
            createdAt: apiUser.created_at,
            lastActiveAt: apiUser.last_login || apiUser.created_at
        };
    };

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllUsers({
                page: currentPage,
                limit: itemsPerPage,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                search: searchQuery || undefined
            });

            if (response.success) {
                const mappedUsers = response.data.users.map(mapApiUserToLocal);
                setUsers(mappedUsers);
                setTotalPages(response.data.pagination?.totalPages || 1);
            }
        } catch (error: any) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Load initial data
    useEffect(() => {
        fetchUsers();
    }, [currentPage, roleFilter, searchQuery]);

    // Filter and sort users (client-side additional filtering)
    const filteredUsers = users
        .filter(user => {
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
            return matchesStatus;
        })
        .sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case 'created':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'orders':
                    aValue = a.stats.totalOrders;
                    bValue = b.stats.totalOrders;
                    break;
                case 'spent':
                    aValue = a.stats.totalSpent;
                    bValue = b.stats.totalSpent;
                    break;
                default:
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

    // Pagination (totalPages is set from API response)
    const paginatedUsers = filteredUsers;

    // Statistics
    const stats = {
        total: users.length,
        customers: users.filter(u => u.role === 'customer').length,
        storeOwners: users.filter(u => u.role === 'store_owner').length,
        admins: users.filter(u => u.role === 'admin').length,
        active: users.filter(u => u.status === 'active').length,
        totalRevenue: users.reduce((sum, u) => sum + u.stats.totalSpent, 0)
    };

    // Handlers
    const handleStatusUpdate = async (userId: string, newStatus: UserData['status']) => {
        try {
            const response = await adminService.updateUser(userId, { 
                is_active: newStatus === 'active' 
            } as any);
            if (response.success) {
                setUsers(prev => prev.map(user =>
                    user.id === userId
                        ? { ...user, status: newStatus }
                        : user
                ));
                toast.success('User status updated');
            }
        } catch (error: any) {
            toast.error('Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await adminService.deleteUser(userId);
                if (response.success) {
                    setUsers(prev => prev.filter(user => user.id !== userId));
                    toast.success('User deleted successfully');
                }
            } catch (error: any) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleViewUser = (user: UserData) => {
        setSelectedUser(user);
        setShowUserDetails(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'inactive': return 'bg-yellow-100 text-yellow-700';
            case 'banned': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700';
            case 'store_owner': return 'bg-blue-100 text-blue-700';
            case 'customer': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="w-3 h-3" />;
            case 'store_owner': return <Crown className="w-3 h-3" />;
            case 'customer': return <User className="w-3 h-3" />;
            default: return <User className="w-3 h-3" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand text-white rounded-lg flex items-center justify-center">
                            <UsersIcon className="w-5 h-5" />
                        </div>
                        Users Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage customer accounts, store owners, and administrators
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {/* Handle export */ }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        Export Users
                    </button>

                    <button
                        onClick={() => setShowAddUser(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Customers</p>
                            <p className="text-2xl font-bold text-green-600">{stats.customers}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Store Owners</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.storeOwners}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <Crown className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Admins</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.active}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-indigo-600">₹{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users by name, email, phone..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                            <option value="all">All Roles</option>
                            <option value="customer">Customers</option>
                            <option value="store_owner">Store Owners</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div>
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [sort, order] = e.target.value.split('-');
                                setSortBy(sort as any);
                                setSortOrder(order as any);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                            <option value="created-desc">Newest First</option>
                            <option value="created-asc">Oldest First</option>
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                            <option value="orders-desc">Most Orders</option>
                            <option value="spent-desc">Highest Spender</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role & Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Orders & Spending
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Active
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-gray-500" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                                    {user.isVerified && (
                                                        <div title="Verified User">
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">ID: {user.id}</p>
                                                <p className="text-xs text-gray-400">
                                                    Joined {formatDate(user.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${getRoleColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                            <br />
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(user.status)}`}>
                                                {user.status === 'active' && <CheckCircle className="w-3 h-3" />}
                                                {user.status === 'inactive' && <Clock className="w-3 h-3" />}
                                                {user.status === 'banned' && <Ban className="w-3 h-3" />}
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-sm text-gray-900">
                                                <Mail className="w-3 h-3 text-gray-400" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Phone className="w-3 h-3 text-gray-400" />
                                                {user.phone}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                {user.address.city}, {user.address.state}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-sm text-gray-900">
                                                <ShoppingCart className="w-3 h-3 text-gray-400" />
                                                {user.stats.totalOrders} orders
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <IndianRupee className="w-3 h-3 text-gray-400" />
                                                ₹{user.stats.totalSpent.toLocaleString()} spent
                                            </div>
                                            {user.stats.totalSavings > 0 && (
                                                <div className="flex items-center gap-1 text-sm text-green-600">
                                                    <Star className="w-3 h-3 text-green-400" />
                                                    ₹{user.stats.totalSavings} saved
                                                </div>
                                            )}
                                            {user.stats.lastOrderDate && (
                                                <div className="text-xs text-gray-500">
                                                    Last: {formatDate(user.stats.lastOrderDate)}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {formatDate(user.lastActiveAt)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {(() => {
                                                const daysDiff = Math.floor((new Date().getTime() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24));
                                                if (daysDiff === 0) return 'Today';
                                                if (daysDiff === 1) return 'Yesterday';
                                                return `${daysDiff} days ago`;
                                            })()}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewUser(user)}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            <button
                                                className="p-1 text-gray-400 hover:text-green-600 transition-colors cursor-pointer"
                                                title="Edit User"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            {user.status === 'active' ? (
                                                <button
                                                    onClick={() => handleStatusUpdate(user.id, 'banned')}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                                    title="Ban User"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusUpdate(user.id, 'active')}
                                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors cursor-pointer"
                                                    title="Activate User"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing page {currentPage} of {totalPages}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 border rounded transition-colors cursor-pointer ${currentPage === page
                                            ? 'bg-brand text-white border-brand'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {showUserDetails && selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => {
                        setShowUserDetails(false);
                        setSelectedUser(null);
                    }}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}

            {/* Add User Modal Placeholder */}
            {showAddUser && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                            <button
                                onClick={() => setShowAddUser(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="text-center py-8">
                            <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-600">Add user form coming soon...</p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowAddUser(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// User Details Modal Component
interface UserDetailsModalProps {
    user: UserData;
    onClose: () => void;
    onStatusUpdate: (userId: string, status: UserData['status']) => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose, onStatusUpdate }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'inactive': return 'bg-yellow-100 text-yellow-700';
            case 'banned': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700';
            case 'store_owner': return 'bg-blue-100 text-blue-700';
            case 'customer': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-8 h-8 text-gray-500" />
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                    {user.isVerified && (
                                        <div title="Verified User">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-600">{user.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleColor(user.role)}`}>
                                        {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(user.status)}`}>
                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">

                    {/* User Statistics */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-600">Total Orders</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-900">{user.stats.totalOrders}</p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <IndianRupee className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-600">Total Spent</span>
                                </div>
                                <p className="text-2xl font-bold text-green-900">₹{user.stats.totalSpent.toLocaleString()}</p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-600">Average Order</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-900">₹{user.stats.avgOrderValue}</p>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm font-medium text-orange-600">Total Savings</span>
                                </div>
                                <p className="text-2xl font-bold text-orange-900">₹{user.stats.totalSavings.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{user.email}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{user.phone}</span>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                    <div className="text-gray-700">
                                        <p>{user.address.street}</p>
                                        <p>{user.address.city}, {user.address.state} - {user.address.pincode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <span className="text-gray-600">Joined: </span>
                                        <span className="text-gray-900">{formatDate(user.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <span className="text-gray-600">Last Active: </span>
                                        <span className="text-gray-900">{formatDate(user.lastActiveAt)}</span>
                                    </div>
                                </div>

                                {user.stats.lastOrderDate && (
                                    <div className="flex items-center gap-3">
                                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <span className="text-gray-600">Last Order: </span>
                                            <span className="text-gray-900">{formatDate(user.stats.lastOrderDate)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Notifications</span>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${user.preferences.notifications ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {user.preferences.notifications ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Marketing</span>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${user.preferences.marketing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {user.preferences.marketing ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Location</span>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${user.preferences.location ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {user.preferences.location ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Management */}
                    {user.role !== 'admin' && (
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-gray-700">Current Status:</span>
                                <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(user.status)}`}>
                                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                </span>

                                <select
                                    value={user.status}
                                    onChange={(e) => onStatusUpdate(user.id, e.target.value as UserData['status'])}
                                    className="ml-4 px-3 py-1 border border-gray-300 rounded focus:border-brand focus:ring-1 focus:ring-blue-100 outline-none cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="banned">Banned</option>
                                </select>
                            </div>

                            <p className="text-sm text-gray-500 mt-2">
                                Changing user status will affect their ability to access the platform and place orders.
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                        <button className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                            Edit User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users;