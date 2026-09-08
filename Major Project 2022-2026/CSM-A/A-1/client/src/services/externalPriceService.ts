import api from './api';

export interface ExternalProduct {
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  quantity?: string;
  inStock: boolean;
  imageUrl?: string;
  deliveryTime?: string;
  deliveryFee?: number;
  platform?: string;
}

export interface PlatformResult {
  platform: string;
  success: boolean;
  error?: string;
  products: ExternalProduct[];
  deliveryTime: string;
  deliveryFee: number;
}

export interface ExternalPricesResponse {
  swiggy: PlatformResult;
  zepto: PlatformResult;
  blinkit: PlatformResult;
  searchedProduct: string;
  location: { lat: number; lng: number };
  timestamp: string;
  bestDeal?: ExternalProduct;
  totalProductsFound: number;
}

export interface PlatformSummary {
  platform: string;
  available: boolean;
  productCount?: number;
  lowestPrice?: number;
  deliveryTime?: string;
  deliveryFee?: number;
  totalCost?: number;
  error?: string;
}

export interface ComparisonResponse {
  searchedProduct: string;
  location: { lat: number; lng: number };
  comparison: PlatformSummary[];
  bestOverallDeal: PlatformSummary | null;
  timestamp: string;
}

/**
 * Get prices from all external platforms (Swiggy, Zepto, Blinkit)
 */
export const getExternalPrices = async (
  productName: string,
  lat?: number,
  lng?: number
): Promise<ExternalPricesResponse> => {
  const response = await api.get('/external/prices', {
    params: { productName, lat, lng }
  });
  return response.data.data;
};

/**
 * Get prices from a specific platform
 */
export const getPlatformPrices = async (
  platform: 'swiggy' | 'zepto' | 'blinkit',
  productName: string,
  lat?: number,
  lng?: number
): Promise<PlatformResult> => {
  const response = await api.get(`/external/prices/${platform}`, {
    params: { productName, lat, lng }
  });
  return response.data.data;
};

/**
 * Compare prices across all platforms
 */
export const comparePrices = async (
  productName: string,
  lat?: number,
  lng?: number
): Promise<ComparisonResponse> => {
  const response = await api.get('/external/compare', {
    params: { productName, lat, lng }
  });
  return response.data.data;
};

/**
 * Transform external products to StoreOption format for Search.tsx
 */
export const transformToStoreOptions = (
  externalData: ExternalPricesResponse
): Array<{
  id: string;
  type: 'delivery';
  storeName: string;
  price: number;
  originalPrice?: number;
  deliveryFee: number;
  deliveryTime: string;
  rating: number;
  inStock: boolean;
  products: ExternalProduct[];
}> => {
  const options = [];

  // Process Swiggy
  if (externalData.swiggy.success && externalData.swiggy.products.length > 0) {
    const lowestPriceProduct = externalData.swiggy.products.reduce(
      (min, p) => (p.price && p.price < (min.price || Infinity) ? p : min),
      externalData.swiggy.products[0]
    );
    
    options.push({
      id: 'swiggy',
      type: 'delivery' as const,
      storeName: 'Swiggy Instamart',
      price: lowestPriceProduct.price || 0,
      originalPrice: lowestPriceProduct.originalPrice,
      deliveryFee: externalData.swiggy.deliveryFee,
      deliveryTime: externalData.swiggy.deliveryTime,
      rating: 4.1,
      inStock: lowestPriceProduct.inStock !== false,
      products: externalData.swiggy.products
    });
  }

  // Process Zepto
  if (externalData.zepto.success && externalData.zepto.products.length > 0) {
    const lowestPriceProduct = externalData.zepto.products.reduce(
      (min, p) => (p.price && p.price < (min.price || Infinity) ? p : min),
      externalData.zepto.products[0]
    );
    
    options.push({
      id: 'zepto',
      type: 'delivery' as const,
      storeName: 'Zepto',
      price: lowestPriceProduct.price || 0,
      originalPrice: lowestPriceProduct.originalPrice,
      deliveryFee: externalData.zepto.deliveryFee,
      deliveryTime: externalData.zepto.deliveryTime,
      rating: 4.3,
      inStock: lowestPriceProduct.inStock !== false,
      products: externalData.zepto.products
    });
  }

  // Process Blinkit
  if (externalData.blinkit.success && externalData.blinkit.products.length > 0) {
    const lowestPriceProduct = externalData.blinkit.products.reduce(
      (min, p) => (p.price && p.price < (min.price || Infinity) ? p : min),
      externalData.blinkit.products[0]
    );
    
    options.push({
      id: 'blinkit',
      type: 'delivery' as const,
      storeName: 'Blinkit',
      price: lowestPriceProduct.price || 0,
      originalPrice: lowestPriceProduct.originalPrice,
      deliveryFee: externalData.blinkit.deliveryFee,
      deliveryTime: externalData.blinkit.deliveryTime,
      rating: 4.0,
      inStock: lowestPriceProduct.inStock !== false,
      products: externalData.blinkit.products
    });
  }

  return options;
};

export default {
  getExternalPrices,
  getPlatformPrices,
  comparePrices,
  transformToStoreOptions
};
