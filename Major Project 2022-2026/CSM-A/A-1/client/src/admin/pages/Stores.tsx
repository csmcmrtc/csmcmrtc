import React, { useState, useEffect } from 'react';
import {
    Store,
    Plus,
    Search,
    MapPin,
    Phone,
    Mail,
    Star,
    Clock,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    AlertTriangle,
    Truck,
    Building2,
    // RefreshCw
} from 'lucide-react';
import AddStoreModal from '../components/AddStoreModal';
import EditStoreModal from '../components/EditStoreModal';
import adminService, { type AdminStore } from '../../services/adminService';
import { toast } from 'react-toastify';

// Types
interface StoreData {
    id: string;
    name: string;
    type: 'local' | 'online';
    address: string;
    phone: string;
    email: string;
    rating: number;
    totalOrders: number;
    isActive: boolean;
    logo?: string;
    deliveryTime?: string;
    deliveryFee?: number;
    createdAt: string;
}

const Stores: React.FC = () => {
    // State
    const [stores, setStores] = useState<StoreData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'local' | 'online'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);

    // Map API store to local format
    const mapApiStoreToLocal = (apiStore: AdminStore): StoreData => {
        return {
            id: apiStore.id,
            name: apiStore.name,
            type: (apiStore.type as 'local' | 'online') || 'local',
            address: apiStore.address || '',
            phone: apiStore.phone || '',
            email: apiStore.email || '',
            rating: apiStore.rating || 0,
            totalOrders: apiStore.total_ratings || 0,
            isActive: apiStore.is_active,
            createdAt: apiStore.created_at
        };
    };

    // Fetch stores from API
    const fetchStores = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllStores({
                search: searchQuery || undefined
            });

            if (response.success) {
                const mappedStores = response.data.stores.map(mapApiStoreToLocal);
                setStores(mappedStores);
            }
        } catch (error: any) {
            toast.error('Failed to load stores');
        } finally {
            setLoading(false);
        }
    };

    // Load data
    useEffect(() => {
        fetchStores();
    }, [searchQuery]);

    // Filter stores
    const filteredStores = stores.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || store.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // Statistics
    const stats = {
        total: stores.length,
        local: stores.filter(s => s.type === 'local').length,
        online: stores.filter(s => s.type === 'online').length,
        active: stores.filter(s => s.isActive).length
    };

    // Handlers
    const handleToggleStatus = async (storeId: string) => {
        try {
            const response = await adminService.toggleStoreStatus(storeId);
            if (response.success) {
                setStores(prev => prev.map(store =>
                    store.id === storeId ? { ...store, isActive: !store.isActive } : store
                ));
                toast.success('Store status updated');
            }
        } catch (error: any) {
            toast.error('Failed to update store status');
        }
    };

    const handleDeleteStore = async (storeId: string) => {
        if (confirm('Are you sure you want to delete this store?')) {
            try {
                const response = await adminService.deleteStore(storeId);
                if (response.success) {
                    setStores(prev => prev.filter(store => store.id !== storeId));
                    toast.success('Store deleted successfully');
                }
            } catch (error: any) {
                toast.error('Failed to delete store');
            }
        }
    };

    const handleEditStore = (store: StoreData) => {
        setSelectedStore(store);
        setShowEditModal(true);
    };

    const handleSaveNewStore = (_newStore: any) => {
        fetchStores(); // Refresh the list
        setShowAddModal(false);
        toast.success('Store added successfully');
    };

    const handleUpdateStore = (_updatedStore: StoreData) => {
        fetchStores(); // Refresh the list
        setShowEditModal(false);
        setSelectedStore(null);
        toast.success('Store updated successfully');
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedStore(null);
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
                            <Store className="w-5 h-5" />
                        </div>
                        Store Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage your partner stores and delivery platforms
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Add Store
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Stores</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Local Stores</p>
                            <p className="text-2xl font-bold text-green-600">{stats.local}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Online Stores</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.online}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <Truck className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Stores</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.active}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search stores by name or address..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div className="md:w-48">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                            <option value="all">All Store Types</option>
                            <option value="local">Local Stores</option>
                            <option value="online">Online Stores</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stores Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredStores.map((store) => (
                    <div key={store.id} className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${store.type === 'local'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-purple-100 text-purple-600'
                                    }`}>
                                    {store.type === 'local' ? (
                                        <Building2 className="w-6 h-6" />
                                    ) : (
                                        <Truck className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{store.name}</h3>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${store.type === 'local'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-purple-100 text-purple-700'
                                        }`}>
                                        {store.type === 'local' ? <Building2 className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                                        {store.type === 'local' ? 'Local Store' : 'Online Platform'}
                                    </span>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <button
                                onClick={() => handleToggleStatus(store.id)}
                                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer ${store.isActive
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                    }`}
                            >
                                {store.isActive ? (
                                    <>
                                        <CheckCircle className="w-3 h-3" />
                                        Active
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-3 h-3" />
                                        Inactive
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Store Details */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{store.address}</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-sm">{store.phone}</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{store.email}</span>
                                </div>
                            </div>

                            {/* Online Store Details */}
                            {store.type === 'online' && store.deliveryTime && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">{store.deliveryTime}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Truck className="w-4 h-4" />
                                        <span className="text-sm">₹{store.deliveryFee} delivery fee</span>
                                    </div>
                                </div>
                            )}

                            {/* Rating and Orders */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium text-gray-900">{store.rating}</span>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        {store.totalOrders} orders
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => handleEditStore(store)}
                                        className="p-1 text-gray-400 hover:text-green-600 transition-colors cursor-pointer"
                                        title="Edit Store"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => handleDeleteStore(store.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                        title="Delete Store"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results */}
            {filteredStores.length === 0 && (
                <div className="text-center py-12">
                    <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No stores found</h3>
                    <p className="text-gray-600">
                        {searchQuery || typeFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first store'
                        }
                    </p>
                </div>
            )}

            {/* Add Store Modal */}
            {showAddModal && (
                <AddStoreModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleSaveNewStore}
                />
            )}

            {/* Edit Store Modal */}
            {showEditModal && selectedStore && (
                <EditStoreModal
                    store={selectedStore}
                    onClose={handleCloseEditModal}
                    onSave={handleUpdateStore}
                />
            )}
        </div>
    );
};

export default Stores;