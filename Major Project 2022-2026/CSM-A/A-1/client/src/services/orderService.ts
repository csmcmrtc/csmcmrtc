import api from './api';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    image_url: string;
    unit: string;
  };
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  store_id: string;
  customer_id: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'cod' | 'upi' | 'card' | 'wallet';
  delivery_address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
  store?: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  order_items?: OrderItem[];
}

export interface CreateOrderData {
  store_id: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
  delivery_address: Order['delivery_address'];
  payment_method: Order['payment_method'];
  notes?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const orderService = {
  // Create order
  createOrder: async (data: CreateOrderData): Promise<{ success: boolean; message: string; data: { order: Order } }> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Get my orders
  getMyOrders: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrdersResponse> => {
    const response = await api.get('/orders/my', { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<{ success: boolean; data: { order: Order } }> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: string, reason?: string): Promise<{ success: boolean; message: string; data: { order: Order } }> => {
    const response = await api.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Track order
  trackOrder: async (id: string): Promise<{
    success: boolean;
    data: {
      order: Order;
      timeline: Array<{
        status: string;
        title: string;
        description: string;
        timestamp: string;
        is_completed: boolean;
        is_current: boolean;
      }>;
    };
  }> => {
    const response = await api.get(`/orders/${id}/track`);
    return response.data;
  },

  // Reorder
  reorder: async (orderId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      added_items: number;
      unavailable_items: Array<{ product_id: string; product_name: string; reason: string }>;
    };
  }> => {
    const response = await api.post(`/orders/${orderId}/reorder`);
    return response.data;
  },

  // Update payment status (for COD confirmation, etc.)
  updatePaymentStatus: async (id: string, status: Order['payment_status']): Promise<{
    success: boolean;
    data: { order: Order };
  }> => {
    const response = await api.patch(`/orders/${id}/payment-status`, { payment_status: status });
    return response.data;
  },
};

export default orderService;
