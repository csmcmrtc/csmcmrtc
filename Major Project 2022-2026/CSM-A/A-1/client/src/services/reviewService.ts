import api from './api';

export interface Review {
  id: string;
  user_id: string;
  product_id?: string;
  store_id?: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  product?: {
    id: string;
    name: string;
    image_url: string;
  };
  store?: {
    id: string;
    name: string;
  };
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    summary: {
      average_rating: number;
      total_reviews: number;
      rating_breakdown: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CreateReviewData {
  product_id?: string;
  store_id?: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
}

const reviewService = {
  // Get product reviews
  getProductReviews: async (productId: string, params: {
    page?: number;
    limit?: number;
    rating?: number;
  }): Promise<ReviewsResponse> => {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  },

  // Get store reviews
  getStoreReviews: async (storeId: string, params: {
    page?: number;
    limit?: number;
    rating?: number;
  }): Promise<ReviewsResponse> => {
    const response = await api.get(`/reviews/store/${storeId}`, { params });
    return response.data;
  },

  // Get my reviews
  getMyReviews: async (params: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      reviews: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> => {
    const response = await api.get('/reviews/my', { params });
    return response.data;
  },

  // Check if user can review
  canReview: async (productId: string): Promise<{
    success: boolean;
    data: {
      can_review: boolean;
      reason?: string;
      has_purchased: boolean;
      is_verified_purchase: boolean;
      existing_review_id?: string;
    };
  }> => {
    const response = await api.get(`/reviews/can-review/${productId}`);
    return response.data;
  },

  // Create review
  createReview: async (data: CreateReviewData): Promise<{
    success: boolean;
    message: string;
    data: Review;
  }> => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  // Update review
  updateReview: async (id: string, data: Partial<CreateReviewData>): Promise<{
    success: boolean;
    message: string;
    data: Review;
  }> => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  // Delete review
  deleteReview: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

export default reviewService;
