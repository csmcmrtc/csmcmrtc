import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storeService, { type Store } from '../../services/storeService';

interface StoreState {
  stores: Store[];
  currentStore: Store | null;
  myStore: Store | null;
  storeStats: {
    total_products: number;
    total_orders: number;
    total_revenue: number;
    total_customers: number;
    average_rating: number;
    orders_by_status: Record<string, number>;
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

const initialState: StoreState = {
  stores: [],
  currentStore: null,
  myStore: null,
  storeStats: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchActiveStores = createAsyncThunk(
  'stores/fetchActive',
  async (params: { page?: number; limit?: number; type?: string; search?: string }, { rejectWithValue }) => {
    try {
      const response = await storeService.getActiveStores(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stores');
    }
  }
);

export const fetchStoreById = createAsyncThunk(
  'stores/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await storeService.getStoreById(id);
      return response.data.store;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch store');
    }
  }
);

export const fetchMyStore = createAsyncThunk(
  'stores/fetchMyStore',
  async (_, { rejectWithValue }) => {
    try {
      const response = await storeService.getMyStore();
      return response.data.store;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch store');
    }
  }
);

export const updateMyStore = createAsyncThunk(
  'stores/updateMyStore',
  async (data: Partial<Store>, { rejectWithValue }) => {
    try {
      const response = await storeService.updateMyStore(data);
      return response.data.store;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update store');
    }
  }
);

export const fetchMyStoreStats = createAsyncThunk(
  'stores/fetchMyStoreStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await storeService.getMyStoreStats();
      return response.data.stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const storeSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentStore: (state) => {
      state.currentStore = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active stores
      .addCase(fetchActiveStores.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveStores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stores = action.payload.stores;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchActiveStores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch store by ID
      .addCase(fetchStoreById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStoreById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStore = action.payload;
      })
      .addCase(fetchStoreById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch my store
      .addCase(fetchMyStore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyStore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myStore = action.payload;
      })
      .addCase(fetchMyStore.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update my store
      .addCase(updateMyStore.fulfilled, (state, action) => {
        state.myStore = action.payload;
      })
      // Fetch my store stats
      .addCase(fetchMyStoreStats.fulfilled, (state, action) => {
        state.storeStats = action.payload;
      });
  },
});

export const { clearError, clearCurrentStore } = storeSlice.actions;
export default storeSlice.reducer;
