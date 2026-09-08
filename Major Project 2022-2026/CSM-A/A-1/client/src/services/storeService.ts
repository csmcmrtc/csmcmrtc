import api from './api';

export interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string;
  cover_image_url: string;
  type: 'grocery' | 'pharmacy' | 'electronics' | 'fashion' | 'restaurant' | 'other';
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_ratings: number;
  delivery_fee: number;
  min_order_amount: number;
  opening_hours: Record<string, string>;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface StoresResponse {
  success: boolean;
  data: {
    stores: Store[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const storeService = {
  // Get all active stores
  getActiveStores: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
  }): Promise<StoresResponse> => {
    const response = await api.get('/stores', { params });
    return response.data;
  },

  // Get store by ID
  getStoreById: async (id: string): Promise<{ success: boolean; data: { store: Store } }> => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },

  // Get store products
  getStoreProducts: async (storeId: string, params: {
    page?: number;
    limit?: number;
    category?: string;
    sort_by?: string;
  }): Promise<{
    success: boolean;
    data: {
      products: any[];
      pagination: any;
    };
  }> => {
    const response = await api.get(`/stores/${storeId}/products`, { params });
    return response.data;
  },

  // Get store reviews
  getStoreReviews: async (storeId: string, page: number = 1, limit: number = 10): Promise<{
    success: boolean;
    data: {
      reviews: any[];
      pagination: any;
    };
  }> => {
    const response = await api.get(`/stores/${storeId}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  },

  // ============ STORE ADMIN ROUTES ============

  // Get my store
  getMyStore: async (): Promise<{ success: boolean; data: { store: Store } }> => {
    const response = await api.get('/stores/my/store');
    return response.data;
  },

  // Update my store
  updateMyStore: async (data: Partial<Store>): Promise<{ success: boolean; data: { store: Store } }> => {
    const response = await api.put('/stores/my/store', data);
    return response.data;
  },

  // Get my store orders
  getMyStoreOrders: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    success: boolean;
    data: {
      orders: any[];
      pagination: any;
    };
  }> => {
    const response = await api.get('/stores/my/orders', { params });
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string): Promise<{
    success: boolean;
    data: { order: any };
  }> => {
    const response = await api.patch(`/stores/my/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Get my store customers
  getMyStoreCustomers: async (params: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      customers: any[];
      pagination: any;
    };
  }> => {
    const response = await api.get('/stores/my/customers', { params });
    return response.data;
  },

  // Get my store stats
  getMyStoreStats: async (): Promise<{
    success: boolean;
    data: {
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
    };
  }> => {
    const response = await api.get('/stores/my/stats');
    return response.data;
  },

  // ============ ADMIN ROUTES ============

  // Get all stores (admin)
  getAllStores: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  }): Promise<StoresResponse> => {
    const response = await api.get('/stores/admin/all', { params });
    return response.data;
  },

  // Create store (admin)
  createStore: async (data: Partial<Store> & { owner_id: string }): Promise<{ success: boolean; data: { store: Store } }> => {
    const response = await api.post('/stores/admin/create', data);
    return response.data;
  },

  // Update store (admin)
  updateStore: async (id: string, data: Partial<Store>): Promise<{ success: boolean; data: { store: Store } }> => {
    const response = await api.put(`/stores/admin/${id}`, data);
    return response.data;
  },

  // Delete store (admin)
  deleteStore: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/stores/admin/${id}`);
    return response.data;
  },

  // Toggle store status (admin)
  toggleStoreStatus: async (id: string): Promise<{ success: boolean; data: { store: Store } }> => {
    const response = await api.patch(`/stores/admin/${id}/toggle-status`);
    return response.data;
  },

  // Verify store (admin)
  verifyStore: async (id: string): Promise<{ success: boolean; data: { store: Store } }> => {
    const response = await api.patch(`/stores/admin/${id}/verify`);
    return response.data;
  },
};

export default storeService;
