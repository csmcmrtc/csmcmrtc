let map;
let markerGroup;

// Initialize Leaflet Map
function initMap(lat, lng) {
  if (map) {
    map.remove();
  }
  
  map = L.map('map').setView([lat, lng], 14);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  markerGroup = L.layerGroup().addTo(map);

  // User Marker (Red pulsating pin handled via custom Leaflet icon)
  const redPulsingIcon = L.divIcon({
    className: 'red-pulsing-marker',
    html: `<div class="pulse-ring"></div><div class="center-dot"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  L.marker([lat, lng], { icon: redPulsingIcon }).addTo(markerGroup)
    .bindPopup('Your Current Location')
    .openPopup();

  // Inject CSS for pulsating marker
  const style = document.createElement('style');
  style.textContent = `
    .red-pulsing-marker {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .pulse-ring {
      width: 40px;
      height: 40px;
      background: rgba(192, 57, 43, 0.4);
      border-radius: 50%;
      position: absolute;
      animation: pulsate 1.5s infinite;
    }
    .center-dot {
      width: 12px;
      height: 12px;
      background: #C0392B;
      border-radius: 50%;
      border: 2px solid white;
      z-index: 1;
    }
    @keyframes pulsate {
      0% { transform: scale(0.5); opacity: 0.8; }
      100% { transform: scale(1.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Manual Pin Drop on Map Click
  map.on('click', async (e) => {
    const { lat, lng } = e.latlng;
    updatePosition(lat, lng);
  });

  fetchNearbyPolice(lat, lng);
}

async function updatePosition(lat, lng) {
    if (!markerGroup) return;
    
    // Clear old markers except the user marker which we recreate
    markerGroup.clearLayers();
    
    // Update marker
    const redPulsingIcon = L.divIcon({
        className: 'red-pulsing-marker',
        html: `<div class="pulse-ring"></div><div class="center-dot"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    L.marker([lat, lng], { icon: redPulsingIcon }).addTo(markerGroup)
        .bindPopup('Your New Location')
        .openPopup();
        
    // Update Address & Coords UI
    const address = await getAddressFromCoords(lat, lng);
    document.getElementById('current-address').textContent = address;
    document.getElementById('current-coords').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    
    // Refresh Police
    fetchNearbyPolice(lat, lng);
}

// Query real police stations within 2km radius via Overpass API
async function fetchNearbyPolice(lat, lng) {
  const query = `
    [out:json];
    node["amenity"="police"]
      (around:2000, ${lat}, ${lng});
    out body;
  `;
  
  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Overpass API failed');
    const data = await response.json();
    
    data.elements.forEach(station => {
      const dist = getDistance(lat, lng, station.lat, station.lon);
      const blueIcon = L.divIcon({
        className: 'blue-shield-marker',
        html: `🚔`,
        iconSize: [24, 24]
      });

      const marker = L.marker([station.lat, station.lon], { icon: blueIcon }).addTo(markerGroup);
      marker.bindPopup(`
        <strong>${station.tags.name || 'Police Station'}</strong><br>
        Distance: ${dist.toFixed(2)} km<br>
        <a href="tel:100" class="dial-popup-btn">Call Police</a>
      `);

      // Draw dashed line from user to each station
      L.polyline([[lat, lng], [station.lat, station.lon]], {
        color: '#27AE60',
        weight: 1,
        dashArray: '5, 10',
        opacity: 0.6
      }).addTo(markerGroup);
    });

    if (data.elements.length > 0) {
      const bounds = L.latLngBounds([lat, lng]);
      data.elements.forEach(s => bounds.extend([s.lat, s.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  } catch (err) {
    console.error('Failed to fetch police stations:', err);
  }
}

// Distance helper
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
