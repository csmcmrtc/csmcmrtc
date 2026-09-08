import api from './api';
import { getSavedLocation } from './locationService';

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  compare_at_price?: number;
  unit: string;
  image_url: string;
  images: string[];
  stock: number;
  min_stock?: number;
  sku?: string;
  status: 'active' | 'inactive' | 'out-of-stock';
  is_active?: boolean;
  is_featured: boolean;
  rating: number;
  total_ratings: number;
  total_sales?: number;
  created_at: string;
  updated_at: string;
  distance?: number; // Distance from user in km
  store?: {
    id: string;
    name: string;
    address: string;
    is_active: boolean;
    delivery_fee: number;
    latitude?: number;
    longitude?: number;
    delivery_time?: string;
    rating?: number;
  };
  category?: {
    id: string;
    name: string;
    icon: string;
  };
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    location?: {
      lat: number;
      lng: number;
      radius: number;
    } | null;
  };
}

export interface SearchParams {
  q?: string;
  category?: string;
  store_id?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
  lat?: number;    // User latitude
  lng?: number;    // User longitude
  radius?: number; // Search radius in km (default 2)
}

const productService = {
  // Search products with location
  searchProducts: async (params: SearchParams): Promise<ProductsResponse> => {
    // Auto-include saved location if not provided
    const searchParams = { ...params };
    if (!searchParams.lat || !searchParams.lng) {
      const savedLocation = getSavedLocation();
      if (savedLocation) {
        searchParams.lat = savedLocation.latitude;
        searchParams.lng = savedLocation.longitude;
      }
    }
    const response = await api.get('/products/search', { params: searchParams });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 10): Promise<{ success: boolean; data: { products: Product[] } }> => {
    const response = await api.get('/products/featured', { params: { limit } });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string, page: number = 1, limit: number = 20): Promise<ProductsResponse> => {
    const response = await api.get(`/products/category/${categoryId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get store products (for store admin)
  getMyProducts: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ProductsResponse> => {
    const response = await api.get('/products/my', { params });
    return response.data;
  },

  // Create product (store admin)
  createProduct: async (productData: Partial<Product>): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (store admin)
  updateProduct: async (id: string, productData: Partial<Product>): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (store admin)
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Toggle product status
  toggleProductStatus: async (id: string): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.patch(`/products/${id}/toggle-status`);
    return response.data;
  },

  // Update stock
  updateStock: async (id: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.patch(`/products/${id}/stock`, { quantity, operation });
    return response.data;
  },

  // Get low stock products
  getLowStockProducts: async (threshold: number = 10): Promise<{ success: boolean; data: { products: Product[] } }> => {
    const response = await api.get('/products/low-stock', { params: { threshold } });
    return response.data;
  },

  // Get all categories
  getCategories: async (): Promise<{ success: boolean; data: Category[] }> => {
    const response = await api.get('/products/categories');
    return response.data;
  },
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  is_active: boolean;
}

export default productService;
