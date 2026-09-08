import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reviewService from '../../services/reviewService';
import type { Review, CreateReviewData } from '../../services/reviewService';

interface ReviewState {
  reviews: Review[];
  myReviews: Review[];
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
  } | null;
  canReviewStatus: {
    can_review: boolean;
    has_purchased: boolean;
    is_verified_purchase: boolean;
    existing_review_id?: string;
  } | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  myReviews: [],
  summary: null,
  canReviewStatus: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async ({ productId, page = 1, limit = 10 }: { productId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await reviewService.getProductReviews(productId, { page, limit });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const fetchStoreReviews = createAsyncThunk(
  'reviews/fetchStoreReviews',
  async ({ storeId, page = 1, limit = 10 }: { storeId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await reviewService.getStoreReviews(storeId, { page, limit });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const fetchMyReviews = createAsyncThunk(
  'reviews/fetchMyReviews',
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await reviewService.getMyReviews(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const checkCanReview = createAsyncThunk(
  'reviews/checkCanReview',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await reviewService.canReview(productId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check review status');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async (data: CreateReviewData, { rejectWithValue }) => {
    try {
      const response = await reviewService.createReview(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ id, data }: { id: string; data: Partial<CreateReviewData> }, { rejectWithValue }) => {
    try {
      const response = await reviewService.updateReview(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.summary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews;
        state.summary = action.payload.summary;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch store reviews
      .addCase(fetchStoreReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStoreReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews;
        state.summary = action.payload.summary;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchStoreReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch my reviews
      .addCase(fetchMyReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myReviews = action.payload.reviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check can review
      .addCase(checkCanReview.fulfilled, (state, action) => {
        state.canReviewStatus = action.payload;
      })
      // Create review
      .addCase(createReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = [action.payload, ...state.reviews];
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update review
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        const myIndex = state.myReviews.findIndex(r => r.id === action.payload.id);
        if (myIndex !== -1) {
          state.myReviews[myIndex] = action.payload;
        }
      })
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r.id !== action.payload);
        state.myReviews = state.myReviews.filter(r => r.id !== action.payload);
      });
  },
});

export const { clearError, clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
