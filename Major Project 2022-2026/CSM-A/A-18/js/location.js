const LOCATION_KEY = 'rescue_last_known_location';

// Fetch current location
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now()
        };
        // Cache last known location
        localStorage.setItem(LOCATION_KEY, JSON.stringify(coords));
        resolve(coords);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        const lastKnown = localStorage.getItem(LOCATION_KEY);
        if (lastKnown) {
          resolve(JSON.parse(lastKnown));
        } else {
          // Pass the error code back for specific handling
          reject(err);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 } // Increased to 10s
    );
  });
}

// Reverse Geocode (Address Lookup)
async function getAddressFromCoords(lat, lng) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    return data.display_name;
  } catch (err) {
    console.error('Geocoding error:', err);
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  }
}
