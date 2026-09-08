import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShoppingCart, MapPin, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { resetCart } from '../store/slices/cartSlice';
import { AuthModalContext } from '../App';
import { 
  getSavedLocation, 
  getUserLocationWithAddress, 
  clearLocation,
  type UserLocation 
} from '../services/locationService';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { summary } = useAppSelector((state) => state.cart);
  const { setOpenAuth, setAuthOption } = useContext(AuthModalContext);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);

  const navigate = useNavigate();

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = getSavedLocation();
    if (savedLocation) {
      setUserLocation(savedLocation);
    }
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Include location params if available
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (userLocation) {
        params.set('lat', userLocation.latitude.toString());
        params.set('lng', userLocation.longitude.toString());
      }
      navigate(`/search?${params.toString()}`);
      setIsMenuOpen(false);
    }
  };

  const handleLocationSet = async (): Promise<void> => {
    setIsLoadingLocation(true);
    toast.info('Getting your GPS location...', { autoClose: 2000 });
    try {
      const location = await getUserLocationWithAddress();
      setUserLocation(location);
      toast.success(`Location set to ${location.address}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to get location. Please enable location access in browser settings.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleClearLocation = (): void => {
    clearLocation();
    setUserLocation(null);
    toast.info('Location cleared');
  };

  return (
    <nav className="bg-gradient-to-r from-white/80 to-pink-50/80 backdrop-blur-sm shadow-soft border-b border-pink-200/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/JS_logo.jpg" 
              alt="JustSearch Logo" 
              width="56" 
              height="56" 
              className="w-14 h-14 rounded-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div className="flex flex-col items-center justify-center font-bold text-lg">
              <h1 className="text-brand text-3xl font-bold hidden sm:block">
                JustSearch
              </h1>
              <p className="text-savings text-sm px-2 rounded-full font-semibold hidden md:block">
                Search, Save, Collect
              </p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products (e.g., Amul Butter 500g)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border- border-gray-400 rounded-lg focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <div className="bg-brand text-white px-3 py-1 cursor-pointer rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
                    Search
                  </div>
                </button>
              </div>
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* Set Location Button */}
            <div className="relative group">
              <button
                onClick={handleLocationSet}
                disabled={isLoadingLocation}
                className="flex items-center cursor-pointer space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoadingLocation ? (
                  <Loader2 className="w-4 h-4 text-nearby animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4 text-nearby" />
                )}
                <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                  {isLoadingLocation 
                    ? 'Getting location...' 
                    : userLocation?.address || 'Set Location'}
                </span>
              </button>
              {/* Clear location option */}
              {userLocation && !isLoadingLocation && (
                <button
                  onClick={handleClearLocation}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Clear location"
                >
                  ×
                </button>
              )}
            </div>

            {/* Cart Button */}
            {isAuthenticated && (
              <Link
                to="/payment"
                className="flex items-center space-x-1 bg-brand text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm font-medium">Cart</span>
                {summary.total_items > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {summary.total_items > 99 ? '99+' : summary.total_items}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  {user.name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={async () => { 
                    await dispatch(logout());
                    dispatch(resetCart());
                    setIsMenuOpen(false); 
                    toast.success('Logout successful!'); 
                  }}
                  className="btn-primary text-md cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  onClick={() => {
                    setOpenAuth(true);
                    setAuthOption('login');
                  }}
                  className="text-gray-700 hover:text-brand px-3 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link to="/"
                  onClick={() => {
                    setOpenAuth(true);
                    setAuthOption('signup');
                  }}
                  className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none p-2"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div> {/* Close flex items-center justify-between h-16 */}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-light">
            <div className="px-2 pt-2 pb-3 space-y-3">

              {/* Mobile Search */}
              <div className="px-3">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-light rounded-lg focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </form>
              </div>

              {/* Mobile Set Location */}
              <div className="px-3">
                <button
                  onClick={() => {
                    handleLocationSet();
                    setIsMenuOpen(false);
                  }}
                  disabled={isLoadingLocation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors font-medium cursor-pointer disabled:opacity-50"
                >
                  {isLoadingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  <span className="truncate max-w-[200px]">
                    {isLoadingLocation 
                      ? 'Getting location...' 
                      : userLocation?.address || 'Set Location'}
                  </span>
                </button>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-2 px-3 pt-3 border-t border-light">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-3 py-2 text-gray-700 text-sm font-medium">
                      Welcome, {user.name?.split(' ')[0] || user.email?.split('@')[0]}
                    </div>
                    {summary.total_items > 0 && (
                      <Link
                        to="/payment"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Cart</span>
                        <span className="bg-brand text-white text-xs rounded-full px-2 py-1">
                          {summary.total_items}
                        </span>
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        await dispatch(logout());
                        dispatch(resetCart());
                        setIsMenuOpen(false);
                        toast.success('Logout successful!');
                      }}
                      className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      onClick={() => {
                        setOpenAuth(true);
                        setAuthOption('login');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/"
                      onClick={() => {
                        setOpenAuth(true);
                        setAuthOption('signup');
                        setIsMenuOpen(false);
                      }}
                      className="btn-primary w-full text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )
        }
      </div >
    </nav >
  );
};

export default Navbar;