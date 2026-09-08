import api from './api';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number;
    image_url: string;
    stock: number;
    status: string;
    unit: string;
    store: {
      id: string;
      name: string;
      is_active: boolean;
      delivery_fee: number;
      min_order_amount: number;
    };
  };
  item_total?: number;
}

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItem[];
    grouped_by_store: {
      store: CartItem['product']['store'];
      items: CartItem[];
      subtotal: number;
    }[];
    summary: {
      total_items: number;
      total_amount: number;
      item_count: number;
    };
  };
}

export interface CartCountResponse {
  success: boolean;
  data: {
    count: number;
    unique_items: number;
  };
}

const cartService = {
  // Get cart
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Get cart count
  getCartCount: async (): Promise<CartCountResponse> => {
    const response = await api.get('/cart/count');
    return response.data;
  },

  // Add to cart
  addToCart: async (productId: string, quantity: number = 1): Promise<{ success: boolean; message: string; data: CartItem }> => {
    const response = await api.post('/cart/add', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  // Update cart item
  updateCartItem: async (itemId: string, quantity: number): Promise<{ success: boolean; message: string; data: CartItem }> => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (itemId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  // Clear store cart
  clearStoreCart: async (storeId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/cart/clear/store/${storeId}`);
    return response.data;
  },

  // Validate cart
  validateCart: async (): Promise<{
    success: boolean;
    data: {
      is_valid: boolean;
      valid_items: number;
      issues: Array<{
        cart_item_id: string;
        product_id?: string;
        product_name?: string;
        type: string;
        message: string;
      }>;
    };
  }> => {
    const response = await api.get('/cart/validate');
    return response.data;
  },
};

export default cartService;
