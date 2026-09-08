// Location Service for handling user geolocation and distance calculations

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  timestamp: number;
}

const LOCATION_STORAGE_KEY = 'userLocation';
const MAX_DISTANCE_KM = 2; // Maximum distance for nearby stores

// Save location to localStorage
export const saveLocation = (location: UserLocation): void => {
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
};

// Get location from localStorage
export const getSavedLocation = (): UserLocation | null => {
  const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};

// Clear saved location
export const clearLocation = (): void => {
  localStorage.removeItem(LOCATION_STORAGE_KEY);
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Check if a store is within range
export const isWithinRange = (
  userLat: number,
  userLon: number,
  storeLat: number,
  storeLon: number,
  maxDistance: number = MAX_DISTANCE_KM
): boolean => {
  const distance = calculateDistance(userLat, userLon, storeLat, storeLon);
  return distance <= maxDistance;
};

// Helper function to handle geolocation errors
const handleGeolocationError = (
  error: GeolocationPositionError,
  reject: (reason: Error) => void
): void => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      reject(new Error('Location permission denied. Please enable location access in your browser settings.'));
      break;
    case error.POSITION_UNAVAILABLE:
      reject(new Error('Location information unavailable. Please check your device settings.'));
      break;
    case error.TIMEOUT:
      reject(new Error('Location request timed out. Please try again.'));
      break;
    default:
      reject(new Error('An unknown error occurred while getting location.'));
  }
};

// Get current position using browser geolocation (GPS)
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Use high accuracy GPS like Google Maps
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        handleGeolocationError(error, reject);
      },
      {
        enableHighAccuracy: true,  // Use GPS for accurate location
        timeout: 60000,            // 60 seconds timeout (GPS can take time)
        maximumAge: 0              // Always get fresh location
      }
    );
  });
};

// Get location using IP-based geolocation (fallback when GPS fails)
export const getLocationByIP = async (): Promise<{ latitude: number; longitude: number; city: string }> => {
  try {
    // Using free IP geolocation API
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('IP geolocation failed');
    }
    const data = await response.json();
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city || data.region || 'Unknown'
    };
  } catch {
    // Fallback to another free service
    try {
      const response = await fetch('https://ip-api.com/json/?fields=lat,lon,city,regionName');
      if (!response.ok) {
        throw new Error('IP geolocation failed');
      }
      const data = await response.json();
      return {
        latitude: data.lat,
        longitude: data.lon,
        city: data.city || data.regionName || 'Unknown'
      };
    } catch {
      throw new Error('Could not determine location. Please try again later.');
    }
  }
};

// Reverse geocode to get address from coordinates (using Nominatim - free)
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<{ address: string; city: string }> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'JustSearch App'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    const address = data.address || {};
    
    // Build a readable address
    const parts = [];
    if (address.neighbourhood) parts.push(address.neighbourhood);
    else if (address.suburb) parts.push(address.suburb);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }
    
    return {
      address: parts.join(', ') || data.display_name?.split(',').slice(0, 2).join(', ') || 'Unknown Location',
      city: address.city || address.town || address.village || address.state_district || ''
    };
  } catch (error) {
    return {
      address: 'Current Location',
      city: ''
    };
  }
};

// Get user location with address (accurate GPS)
export const getUserLocationWithAddress = async (): Promise<UserLocation> => {
  // Get accurate GPS location
  const position = await getCurrentPosition();
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  
  // Reverse geocode to get address
  const { address, city } = await reverseGeocode(latitude, longitude);
  
  const location: UserLocation = {
    latitude,
    longitude,
    address,
    city,
    timestamp: Date.now()
  };
  
  // Save to localStorage
  saveLocation(location);
  
  return location;
};

export default {
  saveLocation,
  getSavedLocation,
  clearLocation,
  calculateDistance,
  isWithinRange,
  getCurrentPosition,
  getLocationByIP,
  reverseGeocode,
  getUserLocationWithAddress
};
