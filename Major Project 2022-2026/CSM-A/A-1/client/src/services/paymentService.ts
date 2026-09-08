import api from './api';

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  product_id?: string;
  store_id?: string;
  product_name?: string;
  store_name?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    order_id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_details?: {
    product_id?: string;
    store_id?: string;
    product_name?: string;
    product_image?: string;
    product_price?: number;
    delivery_fee?: number;
    billing_info?: {
      name: string;
      email: string;
      phone: string;
      address?: string;
      pincode?: string;
    };
  };
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: string;
    order_id: string;
    db_order_id?: string;
    order_number?: string;
    status: string;
    amount: number;
    method: string;
    record_id?: string;
  };
}

export interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  email: string;
  contact: string;
  created_at: string;
}

export interface PaymentHistory {
  success: boolean;
  data: {
    payments: Array<{
      id: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      amount: number;
      currency: string;
      status: string;
      method: string;
      created_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const paymentService = {
  /**
   * Create a Razorpay order
   */
  createOrder: async (params: CreateOrderParams): Promise<CreateOrderResponse> => {
    const response = await api.post('/payments/create-order', params);
    return response.data;
  },

  /**
   * Verify payment after completion
   */
  verifyPayment: async (params: VerifyPaymentParams): Promise<VerifyPaymentResponse> => {
    const response = await api.post('/payments/verify', params);
    return response.data;
  },

  /**
   * Get payment details by payment ID
   */
  getPaymentDetails: async (paymentId: string): Promise<{ success: boolean; data: PaymentDetails }> => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  /**
   * Get user's payment history
   */
  getPaymentHistory: async (page: number = 1, limit: number = 10): Promise<PaymentHistory> => {
    const response = await api.get('/payments/history/me', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Initiate refund
   */
  initiateRefund: async (
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; message: string; data: { refund_id: string; amount: number; status: string } }> => {
    const response = await api.post(`/payments/${paymentId}/refund`, {
      amount,
      reason
    });
    return response.data;
  }
};

export default paymentService;
