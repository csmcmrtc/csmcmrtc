import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  MapPin,
  TrendingUp,
  Navigation,
  Clock,
  Star,
  Truck,
  Store,
  ArrowLeft,
  Heart,
  Share2,
  ExternalLink,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import { SiSwiggy } from "react-icons/si";
import { FaZ } from "react-icons/fa6";
import blinkit from "../assets/blinkit.png";
import { MdPayment } from 'react-icons/md';
import productService, { type Product as APIProduct } from '../services/productService';
import { getSavedLocation, type UserLocation } from '../services/locationService';
import { getExternalPrices, type ExternalPricesResponse, type ExternalProduct } from '../services/externalPriceService';
import { toast } from 'react-toastify';

interface Product {
  id: string;
  name: string;
  brand: string;
  size: string;
  image: string;
}

interface StoreOption {
  id: string;
  type: 'local' | 'delivery';
  storeName: string;
  price: number;
  originalPrice?: number;
  deliveryFee?: number;
  deliveryTime?: string;
  distance?: number;
  rating?: number;
  inStock: boolean;
  storeAddress?: string;
  logo?: string | React.ReactNode;
  color?: string;
  products?: ExternalProduct[]; // All products from this platform
}

interface SearchResult {
  product: Product;
  localStores: StoreOption[];
  bestLocalDeal: StoreOption | null;
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const urlLat = searchParams.get('lat');
  const urlLng = searchParams.get('lng');

  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [sortLocalBy, setSortLocalBy] = useState<'price' | 'distance' | 'rating'>('price');
  const [sortOnlineBy, setSortOnlineBy] = useState<'price' | 'deliveryTime' | 'rating'>('price');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [noLocation, setNoLocation] = useState<boolean>(false);
  const [externalPricesLoading, setExternalPricesLoading] = useState<boolean>(false);
  const [externalPricesData, setExternalPricesData] = useState<ExternalPricesResponse | null>(null);
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());

  // Build online stores from external API data or use defaults
  const buildOnlineStores = (_productName?: string): StoreOption[] => {
    const defaultStores: StoreOption[] = [
      {
        id: 'swiggy',
        type: 'delivery',
        storeName: 'Swiggy Instamart',
        price: 0,
        deliveryFee: 30,
        deliveryTime: '15-20 mins',
        rating: 4.1,
        inStock: false,
        logo: <SiSwiggy />,
        color: 'bg-orange-500'
      },
      {
        id: 'zepto',
        type: 'delivery',
        storeName: 'Zepto',
        price: 0,
        deliveryFee: 25,
        deliveryTime: '10-15 mins',
        rating: 4.3,
        inStock: false,
        logo: <FaZ />,
        color: 'bg-purple-500'
      },
      {
        id: 'blinkit',
        type: 'delivery',
        storeName: 'Blinkit',
        price: 0,
        deliveryFee: 35,
        deliveryTime: '12-18 mins',
        rating: 4.0,
        inStock: false,
        logo: blinkit,
        color: 'bg-yellow-500'
      },
    ];

    if (!externalPricesData) return defaultStores;

    const stores: StoreOption[] = [];

    // Process Swiggy
    if (externalPricesData.swiggy?.success && externalPricesData.swiggy.products.length > 0) {
      const bestProduct = externalPricesData.swiggy.products.reduce(
        (min, p) => (p.price && p.price < (min.price || Infinity) ? p : min),
        externalPricesData.swiggy.products[0]
      );
      stores.push({
        id: 'swiggy',
        type: 'delivery',
        storeName: 'Swiggy Instamart',
        price: bestProduct.price || 0,
        originalPrice: bestProduct.originalPrice,
        deliveryFee: externalPricesData.swiggy.deliveryFee || 30,
        deliveryTime: externalPricesData.swiggy.deliveryTime || '15-20 mins',
        rating: 4.1,
        inStock: bestProduct.inStock !== false && bestProduct.price > 0,
        logo: <SiSwiggy />,
        color: 'bg-orange-500',
        products: externalPricesData.swiggy.products
      });
    } else {
      stores.push(defaultStores[0]);
    }

    // Process Zepto
    if (externalPricesData.zepto?.success && externalPricesData.zepto.products.length > 0) {
      const bestProduct = externalPricesData.zepto.products.reduce(
        (min, p) => (p.price && p.price < (min.price || Infinity) ? p : min),
        externalPricesData.zepto.products[0]
      );
      stores.push({
        id: 'zepto',
        type: 'delivery',
        storeName: 'Zepto',
        price: bestProduct.price || 0,
        originalPrice: bestProduct.originalPrice,
        deliveryFee: externalPricesData.zepto.deliveryFee || 25,
        deliveryTime: externalPricesData.zepto.deliveryTime || '10-15 mins',
        rating: 4.3,
        inStock: bestProduct.inStock !== false && bestProduct.price > 0,
        logo: <FaZ />,
        color: 'bg-purple-500',
        products: externalPricesData.zepto.products
      });
    } else {
      stores.push(defaultStores[1]);
    }

    // Process Blinkit
    if (externalPricesData.blinkit?.success && externalPricesData.blinkit.products.length > 0) {
      const bestProduct = externalPricesData.blinkit.products.reduce(
        (min, p) => (p.price && p.price < (min.price || Infinity) ? p : min),
        externalPricesData.blinkit.products[0]
      );
      stores.push({
        id: 'blinkit',
        type: 'delivery',
        storeName: 'Blinkit',
        price: bestProduct.price || 0,
        originalPrice: bestProduct.originalPrice,
        deliveryFee: externalPricesData.blinkit.deliveryFee || 35,
        deliveryTime: externalPricesData.blinkit.deliveryTime || '12-18 mins',
        rating: 4.0,
        inStock: bestProduct.inStock !== false && bestProduct.price > 0,
        logo: blinkit,
        color: 'bg-yellow-500',
        products: externalPricesData.blinkit.products
      });
    } else {
      stores.push(defaultStores[2]);
    }

    return stores;
  };

  // Use useMemo so onlineStores updates when externalPricesData changes
  const onlineStores = useMemo(() => buildOnlineStores(query), [externalPricesData, query]);

  // Fetch external prices from delivery apps
  const fetchExternalPrices = async (productName: string, lat?: number, lng?: number) => {
    if (!productName.trim()) return;

    setExternalPricesLoading(true);
    try {
      const data = await getExternalPrices(productName, lat, lng);
      setExternalPricesData(data);
      
      // Check if any platform returned results
      const hasResults = 
        (data.swiggy?.success && data.swiggy.products.length > 0) ||
        (data.zepto?.success && data.zepto.products.length > 0) ||
        (data.blinkit?.success && data.blinkit.products.length > 0);
      
      if (hasResults) {
        // External prices fetched successfully
      }
    } catch (error) {
      // Don't show error toast - external prices are optional enhancement
    } finally {
      setExternalPricesLoading(false);
    }
  };

  // Fetch products from API based on user location
  useEffect(() => {
    const fetchProducts = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Get user location from URL params or localStorage
      let lat: number | undefined;
      let lng: number | undefined;

      if (urlLat && urlLng) {
        lat = parseFloat(urlLat);
        lng = parseFloat(urlLng);
      } else {
        const savedLocation = getSavedLocation();
        if (savedLocation) {
          lat = savedLocation.latitude;
          lng = savedLocation.longitude;
          setUserLocation(savedLocation);
        }
      }

      if (!lat || !lng) {
        setNoLocation(true);
        toast.warning('Set your location to see nearby stores within 2km');
      } else {
        setNoLocation(false);
      }

      // Fetch external prices from Swiggy, Zepto, Blinkit
      fetchExternalPrices(query, lat, lng);

      try {
        const response = await productService.searchProducts({
          q: query,
          lat,
          lng,
          radius: 2, // 2km radius
          limit: 50
        });

        if (response.success && response.data.products.length > 0) {
          // Group products and transform to SearchResult format
          const searchResults = transformAPIResults(response.data.products);
          setResults(searchResults);
        } else {
          setResults([]);
        }
      } catch (error) {
        toast.error('Failed to search products. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, urlLat, urlLng]);

  // Transform API products to SearchResult format
  const transformAPIResults = (products: APIProduct[]): SearchResult[] => {
    // Group products by name/brand to show different store options
    const productGroups = new Map<string, APIProduct[]>();

    products.forEach(product => {
      const key = `${product.name}-${product.unit || ''}`;
      if (!productGroups.has(key)) {
        productGroups.set(key, []);
      }
      productGroups.get(key)!.push(product);
    });

    const results: SearchResult[] = [];

    productGroups.forEach((groupProducts, _key) => {
      const firstProduct = groupProducts[0];

      // Convert to local store options
      const localStores: StoreOption[] = groupProducts.map(p => ({
        id: p.store?.id || p.id,
        type: 'local' as const,
        storeName: p.store?.name || 'Unknown Store',
        price: p.price,
        originalPrice: p.original_price,
        distance: p.distance,
        rating: p.store?.rating || p.rating,
        inStock: p.stock > 0 && p.status === 'active',
        storeAddress: p.store?.address,
        deliveryTime: p.store?.delivery_time,
        deliveryFee: p.store?.delivery_fee
      }));

      // Sort to find best local deal
      const sortedLocalStores = [...localStores].sort((a, b) => a.price - b.price);
      const bestLocalDeal = sortedLocalStores.find(s => s.inStock) || null;

      results.push({
        product: {
          id: firstProduct.id,
          name: firstProduct.name,
          brand: firstProduct.name.split(' ')[0], // Extract brand from name
          size: firstProduct.unit || '',
          image: firstProduct.image_url || 'https://via.placeholder.com/150x150?text=Product'
        },
        localStores,
        bestLocalDeal
      });
    });

    return results;
  };

  const handleNewSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    }
  };

  // Navigate to payment page with product and store details
  const handlePayNow = (product: Product, store: StoreOption, type: 'local' | 'delivery') => {
    navigate('/payment', {
      state: {
        product: {
          id: product.id,
          name: product.name,
          brand: product.brand,
          size: product.size,
          image: product.image,
          price: store.price
        },
        store: {
          id: store.id,
          name: store.storeName,
          type: type,
          address: store.storeAddress || '',
          distance: store.distance,
          rating: store.rating,
          deliveryTime: store.deliveryTime,
          deliveryFee: store.deliveryFee || 0,
          logo: typeof store.logo === 'string' ? store.logo : undefined,
          color: store.color
        }
      }
    });
  };

  const getTotalPrice = (store: StoreOption) => {
    return store.price + (store.deliveryFee || 0);
  };

  const getSortedLocalStores = (stores: StoreOption[]) => {
    return [...stores].sort((a, b) => {
      switch (sortLocalBy) {
        case 'price':
          return a.price - b.price;
        case 'distance':
          return (a.distance || 999) - (b.distance || 999);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
  };

  const getSortedOnlineStores = (stores: StoreOption[]) => {
    return [...stores].sort((a, b) => {
      switch (sortOnlineBy) {
        case 'price':
          return getTotalPrice(a) - getTotalPrice(b);
        case 'deliveryTime':
          const aTime = parseInt(a.deliveryTime?.split('-')[0] || '999');
          const bTime = parseInt(b.deliveryTime?.split('-')[0] || '999');
          return aTime - bTime;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
  };

  // Compute best online deal from onlineStores
  const getBestOnlineDeal = () => {
    const availableOnlineStores = onlineStores.filter(s => s.inStock);
    if (availableOnlineStores.length === 0) return null;
    return availableOnlineStores.reduce((best, current) =>
      getTotalPrice(current) < getTotalPrice(best) ? current : best
    );
  };

  // Compute max savings
  const getMaxSavings = (bestLocalDeal: StoreOption | null) => {
    const bestOnlineDeal = getBestOnlineDeal();
    if (!bestOnlineDeal || !bestLocalDeal) return 0;
    const savings = getTotalPrice(bestOnlineDeal) - bestLocalDeal.price;
    return savings > 0 ? savings : 0;
  };

  // Get store URL for online ordering
  const getStoreUrl = (storeId: string, productName: string): string => {
    const encodedProduct = encodeURIComponent(productName);
    switch (storeId) {
      case 'swiggy':
        return `https://www.swiggy.com/instamart/search?query=${encodedProduct}`;
      case 'zepto':
        return `https://www.zeptonow.com/search?query=${encodedProduct}`;
      case 'blinkit':
        return `https://blinkit.com/s/?q=${encodedProduct}`;
      default:
        return '#';
    }
  };

  // Handle order now click - redirect to delivery app
  const handleOrderNow = (store: StoreOption) => {
    const url = getStoreUrl(store.id, query);
    window.open(url, '_blank');
  };

  const handleGetDirections = (store: StoreOption) => {
    if (!store.storeAddress) {
      alert('Store address not available');
      return;
    }

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.storeAddress)}`;

    window.open(mapsUrl, '_blank');
  };

  const toggleStoreExpanded = (storeId: string) => {
    setExpandedStores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storeId)) {
        newSet.delete(storeId);
      } else {
        newSet.add(storeId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Searching for "{query}"
          </h2>
          <p className="text-gray-500">Finding best deals across local stores and delivery apps...</p>
        </div>
      </main>
    );
  }

  if (results.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No results found for "{query}"
          </h2>
          <p className="text-gray-500 mb-4">
            {noLocation
              ? "Set your location to find nearby stores within 2km radius"
              : "No stores found within 2km of your location. Try a different product or expand your search area."
            }
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Try searching with different keywords or check the spelling
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Header Section */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Search Results for "{query}"
            </h1>
            <p className="text-gray-600 mt-1">
              Found {results.length} product{results.length !== 1 ? 's' : ''} •
              {results[0]?.localStores.length} local stores • {onlineStores.length} online stores
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-4 lg:mt-0 lg:ml-8 flex-1 max-w-md">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search another product..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleNewSearch((e.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Location Warning Banner */}
        {noLocation && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Location not set</h3>
              <p className="text-sm text-amber-700 mt-1">
                Set your location using the "Set Location" button in the navbar to see nearby stores within 2km radius.
                Currently showing online delivery options only.
              </p>
            </div>
          </div>
        )}

        {/* Location Info */}
        {userLocation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">
              Showing stores within 2km of: <strong>{userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      {results.map((result) => (
        <div key={result.product.id} className="space-y-8">

          <div className="bg-white rounded-xl shadow-medium border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <img
                src={result.product.image}
                alt={result.product.name}
                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {result.product.name}
                </h2>
                <p className="text-gray-600">{result.product.size}</p>

                {/* Savings Banner */}
                <div className="mt-3 inline-flex items-center bg-savings/10 text-savings-600 px-3 py-1 rounded-full">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    Save up to ₹{getMaxSavings(result.bestLocalDeal)} by choosing local stores
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <Heart className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* Local Stores Section */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl shadow-medium border border-gray-200">

                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-nearby/10 text-nearby rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Local Stores ({result.localStores.length})
                        </h3>
                        <p className="text-sm text-gray-600">Visit nearby stores and save on delivery</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Sort by:</span>
                      <select
                        value={sortLocalBy}
                        onChange={(e) => setSortLocalBy(e.target.value as any)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:border-brand focus:ring-1 focus:ring-blue-100 outline-none"
                      >
                        <option value="price">Best Price</option>
                        <option value="distance">Distance</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Local Stores List */}
                <div className="p-6">
                  <div className="space-y-4">
                    {getSortedLocalStores(result.localStores).map((store) => (
                      <div
                        key={store.id}
                        className={`border rounded-xl p-4 transition-all hover:shadow-medium ${result.bestLocalDeal?.id === store.id
                          ? 'border-savings bg-success-50/50'
                          : 'border-gray-200 hover:border-brand/50'
                          } ${!store.inStock ? 'opacity-60' : ''}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">

                            {/* Store Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{store.storeName}</h4>
                                {result.bestLocalDeal?.id === store.id && (
                                  <span className="bg-savings text-white text-xs px-2 py-1 rounded-full font-medium">
                                    Best Local Deal
                                  </span>
                                )}
                                {!store.inStock && (
                                  <span className="bg-error-100 text-error-700 text-xs px-2 py-1 rounded-full font-medium">
                                    Out of Stock
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{store.distance} km away</span>
                                </div>

                                {store.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span>{store.rating}</span>
                                  </div>
                                )}

                                <button onClick={() => handleGetDirections(store)} className="flex items-center gap-1 text-brand hover:text-blue-600 font-medium cursor-pointer">
                                  <Navigation className="w-3 h-3" />
                                  <span>Get Directions</span>
                                </button>
                              </div>

                              {store.storeAddress && (
                                <p className="text-xs text-gray-500">{store.storeAddress}</p>
                              )}
                            </div>
                          </div>

                          {/* Price and Action */}
                          <div className="text-left sm:text-right w-full sm:w-auto">
                            <div className="mb-3">
                              <div className="text-2xl font-bold text-gray-900">
                                ₹{store.price}
                              </div>
                              <div className="text-xs text-gray-500">No delivery fee</div>
                            </div>

                            {store.inStock ? (
                              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2'>
                                <button onClick={() => handlePayNow(result.product, store, 'local')} className="w-full sm:w-auto bg-brand hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                  <MdPayment className="w-4 h-4" />
                                  Pay Now
                                </button>
                                <button onClick={() => handleGetDirections(store)} className="w-full sm:w-auto bg-brand hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                  <MdPayment className="w-4 h-4" />
                                  Pay at Store
                                </button>
                              </div>
                            ) : (
                              <button disabled className="w-full sm:w-auto bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                                Out of Stock
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Online Stores Section - Takes 1/3 width, Vertical Layout */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl shadow-medium border border-gray-200">

                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        Delivery Apps ({onlineStores.filter(s => s.inStock).length})
                        {externalPricesLoading && (
                          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {externalPricesLoading 
                          ? 'Fetching live prices...' 
                          : 'Order online with home delivery'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Sort by:</span>
                    <select
                      value={sortOnlineBy}
                      onChange={(e) => setSortOnlineBy(e.target.value as any)}
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:border-brand focus:ring-1 focus:ring-blue-100 outline-none"
                    >
                      <option value="price">Total Price</option>
                      <option value="deliveryTime">Delivery Time</option>
                      <option value="rating">Rating</option>
                    </select>
                  </div>
                </div>

                {/* External Prices Loading Skeleton */}
                {externalPricesLoading && (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="flex justify-between mb-3">
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="text-center mb-3">
                          <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Online Stores List - Vertical */}
                {!externalPricesLoading && (
                <div className="p-4">
                  <div className="space-y-3">
                    {getSortedOnlineStores(onlineStores).map((store) => (
                      <div
                        key={store.id}
                        className={`border rounded-lg p-4 transition-all hover:shadow-soft ${getBestOnlineDeal()?.id === store.id
                          ? 'border-blue-300 bg-blue-50/50'
                          : 'border-gray-200 hover:border-orange-300'
                          } ${!store.inStock ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 ${store.color} text-white rounded-lg flex items-center justify-center text-sm`}>
                              {typeof store.logo === 'string' ? (
                                <img
                                  src={store.logo}
                                  alt={store.storeName}
                                  className="w-full h-full object-contain rounded-lg"
                                />
                              ) : (
                                store.logo
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{store.storeName}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                {store.rating && (
                                  <>
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span>{store.rating}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {getBestOnlineDeal()?.id === store.id && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Best Online
                            </span>
                          )}
                        </div>

                        {/* Delivery Info */}
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{store.deliveryTime} mins</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            <span>{store.deliveryFee ? `₹${store.deliveryFee}` : 'FREE'}</span>
                          </div>
                        </div>

                        {/* Stock Status */}
                        {!store.inStock && (
                          <div className="bg-error-100 text-error-700 text-xs px-2 py-1 rounded-full mb-3 text-center">
                            Out of Stock
                          </div>
                        )}

                        {/* Price Display */}
                        <div className="text-center mb-3">
                          <div className="text-lg font-bold text-gray-900">
                            ₹{getTotalPrice(store)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ₹{store.price} {store.deliveryFee ? `+ ₹${store.deliveryFee} delivery` : '+ FREE delivery'}
                          </div>
                        </div>

                        {store.inStock ? (
                          <button 
                            onClick={() => handleOrderNow(store)}
                            className={`w-full ${store.color} hover:opacity-90 text-white py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer`}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Order Now
                          </button>
                        ) : (
                          <button disabled className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                            Out of Stock
                          </button>
                        )}

                        {/* Product Details Section */}
                        {store.products && store.products.length > 0 && (
                          <div className="mt-3 border-t border-gray-200 pt-3">
                            <button
                              onClick={() => toggleStoreExpanded(store.id)}
                              className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                <span className="font-medium">View {store.products.length} Products</span>
                              </div>
                              {expandedStores.has(store.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>

                            {expandedStores.has(store.id) && (
                              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                                {store.products.map((product, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h5 className="text-sm font-medium text-gray-900 line-clamp-2">
                                          {product.name}
                                        </h5>
                                        {product.quantity && (
                                          <span className="text-xs text-gray-500">
                                            {product.quantity}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-right ml-2">
                                        <div className="text-sm font-bold text-gray-900">
                                          ₹{product.price}
                                        </div>
                                        {product.originalPrice && product.originalPrice !== product.price && (
                                          <div className="text-xs text-gray-400 line-through">
                                            ₹{product.originalPrice}
                                          </div>
                                        )}
                                        {product.discount && (
                                          <span className="text-xs text-green-600 font-medium">
                                            {product.discount}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Comparison */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-700 mb-2">💡 Quick Comparison:</div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Cheapest Online:</span>
                        <span className="font-medium">
                          {getBestOnlineDeal() ? `₹${getTotalPrice(getBestOnlineDeal()!)}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cheapest Local:</span>
                        <span className="font-medium text-savings">
                          {result.bestLocalDeal ? `₹${result.bestLocalDeal.price}` : 'N/A'}
                        </span>
                      </div>
                      {result.bestLocalDeal && getBestOnlineDeal() && (
                        <div className="flex justify-between pt-1 border-t border-gray-200">
                          <span>You Save:</span>
                          <span className="font-bold text-savings">
                            ₹{getMaxSavings(result.bestLocalDeal)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Comparison Summary */}
          <div className="bg-gradient-to-r from-brand/10 to-blue-100 rounded-xl p-6 border border-brand/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand" />
              Price Comparison Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Best Local Deal */}
              {result.bestLocalDeal && (
                <div className="bg-white rounded-lg p-4 border border-success/20">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-savings text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      <Store className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Best Local Deal</h4>
                    <p className="text-sm text-gray-600 mb-2">{result.bestLocalDeal.storeName}</p>
                    <div className="text-2xl font-bold text-savings">₹{result.bestLocalDeal.price}</div>
                    <p className="text-xs text-gray-500">{result.bestLocalDeal.distance} km • No delivery fee</p>
                  </div>
                </div>
              )}

              {/* Best Online Deal */}
              {getBestOnlineDeal() && (
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      <Truck className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Best Online Deal</h4>
                    <p className="text-sm text-gray-600 mb-2">{getBestOnlineDeal()!.storeName}</p>
                    <div className="text-2xl font-bold text-orange-600">₹{getTotalPrice(getBestOnlineDeal()!)}</div>
                    <p className="text-xs text-gray-500">
                      {getBestOnlineDeal()!.deliveryTime} mins •
                      {getBestOnlineDeal()!.deliveryFee ? ` ₹${getBestOnlineDeal()!.deliveryFee} delivery` : ' FREE delivery'}
                    </p>
                  </div>
                </div>
              )}

              {/* Savings */}
              {result.bestLocalDeal && getBestOnlineDeal() && (
                <div className="bg-white rounded-lg p-4 border border-brand/20">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Your Savings</h4>
                    <p className="text-sm text-gray-600 mb-2">By choosing local store</p>
                    <div className="text-2xl font-bold text-brand">
                      ₹{getMaxSavings(result.bestLocalDeal)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {getTotalPrice(getBestOnlineDeal()!) > 0 ? Math.round((getMaxSavings(result.bestLocalDeal) / getTotalPrice(getBestOnlineDeal()!)) * 100) : 0}% savings
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              {result.bestLocalDeal && (
                <button 
                  onClick={() => handlePayNow(result.product, result.bestLocalDeal!, 'local')}
                  className="flex items-center justify-center gap-2 bg-savings hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <Store className="w-5 h-5" />
                  Choose Best Local Deal - Save ₹{getMaxSavings(result.bestLocalDeal)}
                </button>
              )}

              {getBestOnlineDeal() && (
                <button 
                  onClick={() => handleOrderNow(getBestOnlineDeal()!)}
                  className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <Truck className="w-5 h-5" />
                  Order Online ({getBestOnlineDeal()!.deliveryTime} mins)
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Related Searches */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Related Products
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            'Amul Cheese 200g',
            'Mother Dairy Butter',
            'Britannia Bread',
            'Tata Salt',
            'Fortune Oil 1L',
            'Basmati Rice 5kg',
            'Maggi Noodles'
          ].map((related, index) => (
            <button
              key={index}
              onClick={() => handleNewSearch(related)}
              className="bg-gray-100 hover:bg-brand hover:text-white text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              {related}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Search;