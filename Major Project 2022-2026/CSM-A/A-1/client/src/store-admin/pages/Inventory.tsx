import { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Minus,
  History,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  FileText,
  Settings,
  Loader2
} from 'lucide-react';
import productService from '../../services/productService';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  lastRestocked: string;
  stockValue: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock';
  incoming: number;
  outgoing: number;
  reserved: number;
}

interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  date: string;
  reason: string;
  performedBy: string;
  reference?: string;
}

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  turnoverRate: number;
}

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    overstockItems: 0,
    turnoverRate: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showStockHistory, setShowStockHistory] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: 0,
    type: 'in' as 'in' | 'out',
    reason: ''
  });

  // Helper to determine stock status
  const getStockStatus = (stock: number, minStock: number, maxStock: number): InventoryItem['status'] => {
    if (stock === 0) return 'out-of-stock';
    if (stock < minStock) return 'low-stock';
    if (stock > maxStock) return 'overstock';
    return 'in-stock';
  };

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getMyProducts({});
      const products = response?.data?.products || [];

      // Transform products to inventory items
      const inventoryItems: InventoryItem[] = products.map((product: any) => {
        const currentStock = product.stock || 0;
        const minStock = product.min_stock || 10;
        const maxStock = product.max_stock || minStock * 10;
        const price = product.price || 0;

        return {
          id: product.id,
          productName: product.name || 'Unknown Product',
          sku: product.sku || `SKU-${product.id.slice(0, 8)}`,
          category: typeof product.category === 'string' ? product.category : product.category?.name || 'Uncategorized',
          currentStock,
          minStock,
          maxStock,
          unit: product.unit || 'pieces',
          location: product.location || '-',
          lastRestocked: product.last_restocked || product.updated_at || new Date().toISOString(),
          stockValue: currentStock * price,
          status: getStockStatus(currentStock, minStock, maxStock),
          incoming: 0,
          outgoing: 0,
          reserved: 0
        };
      });

      setInventory(inventoryItems);

      // Calculate stats
      const totalProducts = inventoryItems.length;
      const totalValue = inventoryItems.reduce((sum, item) => sum + item.stockValue, 0);
      const lowStockItems = inventoryItems.filter(item => item.status === 'low-stock').length;
      const outOfStockItems = inventoryItems.filter(item => item.status === 'out-of-stock').length;
      const overstockItems = inventoryItems.filter(item => item.status === 'overstock').length;

      setStats({
        totalProducts,
        totalValue,
        lowStockItems,
        outOfStockItems,
        overstockItems,
        turnoverRate: 0 // Would need sales data to calculate
      });

    } catch (err: any) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Stock movements (would come from API in production)
  const stockMovements: StockMovement[] = [];

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      case 'overstock':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle className="h-4 w-4" />;
      case 'low-stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'out-of-stock':
        return <XCircle className="h-4 w-4" />;
      case 'overstock':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const getStockBarColor = (item: InventoryItem) => {
    // const percentage = getStockPercentage(item.currentStock, item.maxStock);
    if (item.currentStock === 0) return 'bg-red-500';
    if (item.currentStock < item.minStock) return 'bg-yellow-500';
    if (item.currentStock > item.maxStock) return 'bg-purple-500';
    return 'bg-green-500';
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleQuickAdjustment = async (item: InventoryItem, adjustment: number) => {
    try {
      const newStock = Math.max(0, item.currentStock + adjustment);
      await productService.updateProduct(item.id, { stock: newStock });
      
      setInventory(prev =>
        prev.map(inv =>
          inv.id === item.id
            ? { 
                ...inv, 
                currentStock: newStock,
                status: getStockStatus(newStock, inv.minStock, inv.maxStock)
              }
            : inv
        )
      );
    } catch (err: any) {
      alert('Failed to update stock. Please try again.');
    }
  };

  const openAdjustmentModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAdjustmentModal(true);
    setAdjustmentData({ quantity: 0, type: 'in', reason: '' });
  };

  const handleStockAdjustment = async () => {
    if (!selectedItem || adjustmentData.quantity === 0) return;

    try {
      const adjustedQuantity = adjustmentData.type === 'in' 
        ? adjustmentData.quantity 
        : -adjustmentData.quantity;

      const newStock = Math.max(0, selectedItem.currentStock + adjustedQuantity);
      await productService.updateProduct(selectedItem.id, { stock: newStock });

      setInventory(prev =>
        prev.map(inv =>
          inv.id === selectedItem.id
            ? { 
                ...inv, 
                currentStock: newStock,
                lastRestocked: adjustmentData.type === 'in' ? new Date().toISOString() : inv.lastRestocked,
                status: getStockStatus(newStock, inv.minStock, inv.maxStock)
              }
            : inv
        )
      );

      setShowAdjustmentModal(false);
      setSelectedItem(null);
    } catch (err: any) {
      alert('Failed to update stock. Please try again.');
    }
  };

  const viewStockHistory = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowStockHistory(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchInventory}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage your store inventory</p>
        </div>
        <button
          onClick={fetchInventory}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.totalValue.toLocaleString()}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-1">{stats.lowStockItems}</h3>
              <p className="text-xs text-gray-500 mt-1">Items need restock</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStockItems}</h3>
              <p className="text-xs text-gray-500 mt-1">Urgent attention</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Turnover Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.turnoverRate}x</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.5 this month
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <RefreshCw className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {stats.lowStockItems > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                {stats.lowStockItems} items are running low on stock
              </p>
              <p className="text-sm text-yellow-700">
                Consider restocking soon to avoid stockouts
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors cursor-pointer">
            View Low Stock Items
          </button>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Clothing">Clothing</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="overstock">Overstock</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
              <Filter className="h-4 w-4" />
              More Filters
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              Import
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Movement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quick Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-mono text-gray-900">{item.sku}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          {item.currentStock} {item.unit}
                        </p>
                        <span className="text-xs text-gray-500">
                          (Min: {item.minStock}, Max: {item.maxStock})
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getStockBarColor(item)}`}
                          style={{ width: `${getStockPercentage(item.currentStock, item.maxStock)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{item.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4 text-sm">
                      {item.incoming > 0 && (
                        <div className="flex items-center text-green-600">
                          <ArrowDownCircle className="h-4 w-4 mr-1" />
                          {item.incoming}
                        </div>
                      )}
                      {item.outgoing > 0 && (
                        <div className="flex items-center text-red-600">
                          <ArrowUpCircle className="h-4 w-4 mr-1" />
                          {item.outgoing}
                        </div>
                      )}
                      {item.reserved > 0 && (
                        <div className="flex items-center text-blue-600">
                          <Package className="h-4 w-4 mr-1" />
                          {item.reserved}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">₹{item.stockValue.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickAdjustment(item, 1)}
                        className="p-1.5 bg-green-100 text-green-600 hover:bg-green-200 rounded cursor-pointer"
                        title="Quick add 1"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleQuickAdjustment(item, -1)}
                        className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded cursor-pointer"
                        title="Quick remove 1"
                        disabled={item.currentStock === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAdjustmentModal(item)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        title="Adjust stock"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => viewStockHistory(item)}
                        className="text-gray-600 hover:text-gray-800 cursor-pointer"
                        title="View history"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800 cursor-pointer"
                        title="Generate report"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && selectedItem && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAdjustmentModal(false);
              setSelectedItem(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900">Stock Adjustment</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedItem.productName} ({selectedItem.sku})
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Current Stock */}
                <div>
                  <p className="text-sm text-gray-600">Current Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedItem.currentStock} {selectedItem.unit}
                  </p>
                </div>

                {/* Adjustment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="in"
                        checked={adjustmentData.type === 'in'}
                        onChange={() => setAdjustmentData({...adjustmentData, type: 'in'})}
                        className="mr-2 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">Stock In</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="out"
                        checked={adjustmentData.type === 'out'}
                        onChange={() => setAdjustmentData({...adjustmentData, type: 'out'})}
                        className="mr-2 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">Stock Out</span>
                    </label>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData({...adjustmentData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Enter adjustment reason..."
                  />
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">New Stock Level</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {adjustmentData.type === 'in'
                      ? selectedItem.currentStock + adjustmentData.quantity
                      : Math.max(0, selectedItem.currentStock - adjustmentData.quantity)
                    } {selectedItem.unit}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAdjustmentModal(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStockAdjustment}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {showStockHistory && selectedItem && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowStockHistory(false);
              setSelectedItem(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 flex-shrink-0">
                            <h2 className="text-xl font-semibold text-gray-900">Stock Movement History</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedItem.productName} ({selectedItem.sku})
              </p>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6">
              {/* Current Stock Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedItem.currentStock} {selectedItem.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Incoming</p>
                    <p className="text-lg font-semibold text-green-600">
                      +{selectedItem.incoming}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Outgoing</p>
                    <p className="text-lg font-semibold text-red-600">
                      -{selectedItem.outgoing}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reserved</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {selectedItem.reserved}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock Movements Timeline */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Movements</h3>
                {stockMovements
                  .filter(movement => movement.productId === selectedItem.id)
                  .map((movement) => (
                    <div key={movement.id} className="flex items-start gap-4 border-l-2 border-gray-200 pl-4 pb-4 last:pb-0">
                      <div className={`mt-0.5 rounded-full p-1.5 ${
                        movement.type === 'in' 
                          ? 'bg-green-100' 
                          : movement.type === 'out' 
                          ? 'bg-red-100'
                          : movement.type === 'adjustment'
                          ? 'bg-blue-100'
                          : 'bg-yellow-100'
                      }`}>
                        {movement.type === 'in' && <ArrowDownCircle className="h-4 w-4 text-green-600" />}
                        {movement.type === 'out' && <ArrowUpCircle className="h-4 w-4 text-red-600" />}
                        {movement.type === 'adjustment' && <Settings className="h-4 w-4 text-blue-600" />}
                        {movement.type === 'return' && <RefreshCw className="h-4 w-4 text-yellow-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {movement.type === 'in' && `Stock In: +${movement.quantity}`}
                            {movement.type === 'out' && `Stock Out: -${movement.quantity}`}
                            {movement.type === 'adjustment' && `Adjustment: ${movement.quantity > 0 ? '+' : ''}${movement.quantity}`}
                            {movement.type === 'return' && `Return: +${movement.quantity}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(movement.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">{movement.reason}</p>
                        {movement.reference && (
                          <p className="text-xs text-gray-500 mt-1">Ref: {movement.reference}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">By: {movement.performedBy}</p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Charts Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Stock Trends</h3>
                <div className="bg-gray-50 rounded-lg p-4 h-48 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="mx-auto h-12 w-12 mb-2" />
                    <p className="text-sm">Stock trend chart</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0 bg-white">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                <Download className="h-4 w-4" />
                Export History
              </button>
              <button
                onClick={() => {
                  setShowStockHistory(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              {filteredInventory.length} items found
            </p>
            <div className="flex items-center gap-2">
              <button className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                Select All
              </button>
              <span className="text-gray-400">|</span>
              <button className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                Bulk Update
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
              <FileText className="h-4 w-4" />
              Generate Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer">
              <Plus className="h-4 w-4" />
              Add New Product
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Toolbar (Fixed at bottom on mobile) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
            <Filter className="h-5 w-5" />
            <span className="text-xs">Filter</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
            <Download className="h-5 w-5" />
            <span className="text-xs">Export</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
            <Upload className="h-5 w-5" />
            <span className="text-xs">Import</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-green-600 hover:text-green-700">
            <Plus className="h-5 w-5" />
            <span className="text-xs">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;