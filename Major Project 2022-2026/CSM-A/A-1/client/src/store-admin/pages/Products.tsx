import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    // Eye,
    Package,
    Star,
    AlertTriangle,
    CheckCircle,
    XCircle,
    // Copy,
    Tag,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import productService, { type Product } from '../../services/productService';

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const categories = ['all', 'Dairy', 'Bakery', 'Groceries', 'Vegetables', 'Beverages', 'Meat', 'Electronics', 'Pharmacy'];
    const statuses = ['all', 'active', 'inactive', 'out-of-stock'];

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, selectedStatus, pagination.page]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const params: any = {
                page: pagination.page,
                limit: pagination.limit
            };

            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }

            if (selectedStatus !== 'all') {
                params.status = selectedStatus;
            }

            if (searchTerm) {
                params.search = searchTerm;
            }

            const response = await productService.getMyProducts(params);

            if (response.success) {
                setProducts(response.data.products || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination?.total || 0,
                    totalPages: response.data.pagination?.totalPages || 0
                }));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pagination.page === 1) {
                fetchProducts();
            } else {
                setPagination(prev => ({ ...prev, page: 1 }));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const handleSaveProduct = async (productData: Partial<Product>) => {
        try {
            if (productData.id) {
                // Update existing product
                const { id, ...updateData } = productData;
                await productService.updateProduct(id, updateData);
                toast.success('Product updated successfully!');
            } else {
                // Create new product
                await productService.createProduct(productData);
                toast.success('Product created successfully!');
            }
            
            // Refresh products list
            await fetchProducts();
            
            // Close modals
            setIsEditModalOpen(false);
            setShowAddModal(false);
            setEditingProduct(null);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save product');
            throw err; // Re-throw to let modal handle it
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setDeletingProduct(product);
        }
    };

    const confirmDeleteProduct = async () => {
        if (!deletingProduct) return;

        setIsDeleting(true);
        try {
            await productService.deleteProduct(deletingProduct.id);
            toast.success(`"${deletingProduct.name}" deleted successfully!`);
            await fetchProducts();
            setDeletingProduct(null);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete product');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleStatus = async (productId: string) => {
        try {
            await productService.toggleProductStatus(productId);
            toast.success('Product status updated!');
            await fetchProducts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update product status');
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProduct(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'out-of-stock':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4" />;
            case 'inactive':
                return <XCircle className="w-4 h-4" />;
            case 'out-of-stock':
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    const getStockStatus = (current: number, minimum: number) => {
        if (current === 0) return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50' };
        if (current <= minimum) return { text: 'Low Stock', color: 'text-orange-600', bgColor: 'bg-orange-50' };
        return { text: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-50' };
    };

    // Filter products based on search (API already handles category/status filters)
    const filteredProducts = products.filter(product => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            product.name.toLowerCase().includes(term) ||
            (typeof product.category === 'string' ? product.category : product.category?.name || '').toLowerCase().includes(term) ||
            product.sku?.toLowerCase().includes(term)
        );
    });

    const stats = {
        total: pagination.total || products.length,
        active: products.filter(p => p.status === 'active').length,
        lowStock: products.filter(p => p.stock <= (p.min_stock || 10) && p.stock > 0).length,
        outOfStock: products.filter(p => p.stock === 0).length
    };

    // Helper function to get product status
    const getProductStatus = (product: Product): 'active' | 'inactive' | 'out-of-stock' => {
        if (product.stock === 0) return 'out-of-stock';
        if (product.status !== 'active') return 'inactive';
        return 'active';
    };

    // Loading state
    if (loading && products.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                </div>
            </div>
        );
    }

    // Error state
    if (error && products.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mt-8">
                    <Package className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to load products</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchProducts}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
        const status = getProductStatus(product);
        const stockStatus = getStockStatus(product.stock, product.min_stock || 10);

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                    <img
                        src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                    />
                    {product.is_featured && (
                        <div className="absolute top-2 left-2">
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                            </span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
                        </span>
                    </div>
                </div>

                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                        <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Tag className="w-4 h-4" />
                        <span>{typeof product.category === 'string' ? product.category : product.category?.name || 'Uncategorized'}</span>
                        {product.sku && (
                            <>
                                <span>•</span>
                                <span>SKU: {product.sku}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                            {product.compare_at_price && product.compare_at_price > product.price && (
                                <span className="text-sm text-gray-500 line-through">₹{product.compare_at_price}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{product.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg ${stockStatus.bgColor} mb-3`}>
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                            {stockStatus.text}
                        </span>
                        <span className="text-sm text-gray-600">
                            {product.stock} / {product.min_stock || 10} min
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>Sales: {product.total_sales || 0}</span>
                        <span>Updated: {new Date(product.updated_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => handleEditProduct(product)} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center cursor-pointer">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                        </button>
                        <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ProductRow: React.FC<{ product: Product }> = ({ product }) => {
        const status = getProductStatus(product);
        const stockStatus = getStockStatus(product.stock, product.min_stock || 10);

        return (
            <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={product.image_url || 'https://via.placeholder.com/48?text=No+Image'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                            <h3 className="font-medium text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{typeof product.category === 'string' ? product.category : product.category?.name || 'Uncategorized'}</span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">₹{product.price}</span>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="text-sm text-gray-500 line-through">₹{product.compare_at_price}</span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                        {stockStatus.text} ({product.stock})
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{product.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{product.total_sales || 0}</span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleToggleStatus(product.id)}
                            className="text-gray-600 hover:text-gray-700 cursor-pointer"
                            title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                            {product.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700 cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                    <p className="text-gray-600 mt-1">Manage your store inventory and product listings</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <button
                        onClick={fetchProducts}
                        disabled={loading}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Products</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Low Stock</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.lowStock}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.outOfStock}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex-1 w-full lg:max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search products, SKU, or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>
                                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                </option>
                            ))}
                        </select>

                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                    }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                    }`}
                            >
                                List
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Display */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sales
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map(product => (
                                <ProductRow key={product.id} product={product} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'Get started by adding your first product'
                        }
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center mx-auto cursor-pointer"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </button>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleSaveProduct}
            />

            {editingProduct && (
                <EditProductModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    product={editingProduct}
                    onSave={handleSaveProduct}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                            Delete Product
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            Are you sure you want to delete <strong>"{deletingProduct.name}"</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingProduct(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteProduct}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer disabled:opacity-50 flex items-center justify-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;