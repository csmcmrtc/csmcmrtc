import api from './api';

// Dashboard Stats
export interface DashboardStats {
  users: {
    total: number;
    users: number;
    store_admins: number;
    admins: number;
  };
  stores: {
    total: number;
    active: number;
    inactive: number;
  };
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    delivered: number;
    cancelled: number;
  };
  products: {
    total: number;
    active: number;
    inactive: number;
    outOfStock: number;
  };
  totalRevenue: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  ordered_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  store: {
    id: string;
    name: string;
  };
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'store_admin' | 'admin';
  avatar_url: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  last_login: string;
}

export interface AdminStore {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  type: string;
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_ratings: number;
  created_at: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminOrder {
  id: string;
  order_number: string;
  user_id: string;
  store_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  delivery_address: any;
  ordered_at: string;
  delivered_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  store?: {
    id: string;
    name: string;
  };
  items?: any[];
}

const adminService = {
  // Dashboard
  getDashboardStats: async (): Promise<{ success: boolean; data: DashboardStats }> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getRecentOrders: async (limit: number = 10): Promise<{ success: boolean; data: RecentOrder[] }> => {
    const response = await api.get('/admin/dashboard/recent-orders', { params: { limit } });
    return response.data;
  },

  getRecentUsers: async (limit: number = 10): Promise<{ success: boolean; data: RecentUser[] }> => {
    const response = await api.get('/admin/dashboard/recent-users', { params: { limit } });
    return response.data;
  },

  // Users Management
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<{ success: boolean; data: { users: AdminUser[]; pagination: any } }> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  updateUser: async (id: string, data: Partial<AdminUser>): Promise<{ success: boolean; data: AdminUser }> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Stores Management
  getAllStores: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ success: boolean; data: { stores: AdminStore[]; pagination: any } }> => {
    const response = await api.get('/stores/admin/all', { params });
    return response.data;
  },

  updateStore: async (id: string, data: Partial<AdminStore>): Promise<{ success: boolean; data: AdminStore }> => {
    const response = await api.put(`/stores/admin/${id}`, data);
    return response.data;
  },

  toggleStoreStatus: async (id: string): Promise<{ success: boolean; data: AdminStore }> => {
    const response = await api.patch(`/stores/admin/${id}/toggle-status`);
    return response.data;
  },

  verifyStore: async (id: string): Promise<{ success: boolean; data: AdminStore }> => {
    const response = await api.patch(`/stores/admin/${id}/verify`);
    return response.data;
  },

  deleteStore: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/stores/admin/${id}`);
    return response.data;
  },

  // Orders Management
  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ success: boolean; data: { orders: AdminOrder[]; pagination: any } }> => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  getOrderById: async (id: string): Promise<{ success: boolean; data: AdminOrder }> => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrder: async (id: string, data: Partial<AdminOrder>): Promise<{ success: boolean; data: AdminOrder }> => {
    const response = await api.put(`/admin/orders/${id}`, data);
    return response.data;
  },

  // Products (via store routes)
  getAllProducts: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ success: boolean; data: { products: any[]; pagination: any } }> => {
    const response = await api.get('/products/search', { params });
    return response.data;
  },

  // Settings
  getSystemSettings: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get('/admin/settings');
    return response.data;
  },
};

export default adminService;
