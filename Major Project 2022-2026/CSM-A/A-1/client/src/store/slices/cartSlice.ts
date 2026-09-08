import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService, { type CartItem } from '../../services/cartService';

interface CartState {
  items: CartItem[];
  groupedByStore: {
    store: CartItem['product']['store'];
    items: CartItem[];
    subtotal: number;
  }[];
  summary: {
    total_items: number;
    total_amount: number;
    item_count: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  groupedByStore: [],
  summary: {
    total_items: 0,
    total_amount: 0,
    item_count: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      // Refetch cart to get updated data
      dispatch(fetchCart());
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartService.updateCartItem(itemId, quantity);
      dispatch(fetchCart());
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: string, { rejectWithValue, dispatch }) => {
    try {
      await cartService.removeFromCart(itemId);
      dispatch(fetchCart());
      return itemId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const clearStoreCart = createAsyncThunk(
  'cart/clearStoreCart',
  async (storeId: string, { rejectWithValue, dispatch }) => {
    try {
      await cartService.clearStoreCart(storeId);
      dispatch(fetchCart());
      return storeId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear store cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCart: (state) => {
      state.items = [];
      state.groupedByStore = [];
      state.summary = { total_items: 0, total_amount: 0, item_count: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.groupedByStore = action.payload.grouped_by_store;
        state.summary = action.payload.summary;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartItem.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state) => {
        state.isLoading = false;
      })
      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.groupedByStore = [];
        state.summary = { total_items: 0, total_amount: 0, item_count: 0 };
      });
  },
});

export const { clearError, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
