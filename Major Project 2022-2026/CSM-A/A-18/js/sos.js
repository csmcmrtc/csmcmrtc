const mainSOSBtn = document.getElementById('main-sos-btn');
const cancelZone = document.getElementById('cancel-zone');
const cancelSOSBtn = document.getElementById('cancel-sos');
const cancelTimerBar = document.getElementById('cancel-timer-bar');
const sosHint = document.querySelector('.sos-hint');

let cancelTimeout;
let isSOSActive = false;

// Main SOS Trigger
mainSOSBtn.addEventListener('click', async () => {
  if (isSOSActive) return;

  const contacts = getContacts();
  if (contacts.length === 0) {
    mainSOSBtn.classList.add('shake');
    sosHint.textContent = '⚠️ Add contacts first!';
    setTimeout(() => {
      mainSOSBtn.classList.remove('shake');
      sosHint.textContent = 'Press if unsafe';
    }, 2000);
    showScreen('contacts');
    return;
  }

  isSOSActive = true;
  triggerVisualFeedback();
  startAlertProcess();
});

// Cancel SOS logic
cancelSOSBtn.addEventListener('click', () => {
    clearTimeout(cancelTimeout);
    isSOSActive = false;
    cancelZone.classList.add('hidden');
    mainSOSBtn.classList.remove('sending', 'confirmed');
    mainSOSBtn.querySelector('.sos-text').textContent = 'SOS';
    sosHint.textContent = 'Press if unsafe';
    console.log('SOS Alert Cancelled');
});

// High-level process flow
async function startAlertProcess() {
  // Update UI to sending state
  mainSOSBtn.classList.add('sending');
  mainSOSBtn.querySelector('.sos-text').textContent = '⚠️';
  sosHint.textContent = '🚨 Sending Alert...';

  try {
    const coords = await getCurrentLocation();
    const address = await getAddressFromCoords(coords.lat, coords.lng);
    
    // Dispatch WhatsApp/SMS IMMEDIATELY
    await finalizeAlert(coords, address);
    
    // Show 'Cancel' button after alert fires for 5s only
    cancelZone.classList.remove('hidden');
    cancelTimerBar.style.width = '100%';
    
    // Slight delay to ensure transition triggers
    setTimeout(() => {
        cancelTimerBar.style.width = '0%';
    }, 50);
    
    cancelTimeout = setTimeout(() => {
        cancelZone.classList.add('hidden');
    }, 5000);

  } catch (err) {
    console.error('SOS Location Failure:', err);
    
    // Default location (e.g. Center of Earth/City if needed) or just manual mode
    const fallbackCoords = { lat: 28.6139, lng: 77.2090, timestamp: Date.now() }; // New Delhi default or use last known
    const fallbackAddress = "Location Unavailable - Please drop manual pin on map";

    await finalizeAlert(fallbackCoords, fallbackAddress);
    
    alert('GPS not active. Please tap on the map to set your location.');
    isSOSActive = false;
  }
}

async function finalizeAlert(coords, address) {
    // Update confirmed UI
    mainSOSBtn.classList.add('confirmed');
    mainSOSBtn.querySelector('.sos-text').textContent = '✅';
    sosHint.textContent = '✅ Help is on the way';
    
    // Dispatch WhatsApp/SMS
    const notified = await dispatchAlerts(coords.lat, coords.lng, address);
    
    // Render alert sent screen
    document.getElementById('alert-timestamp').textContent = `Alerted at ${new Date().toLocaleTimeString()}`;
    document.getElementById('current-address').textContent = address;
    document.getElementById('current-coords').textContent = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    
    const notifiedList = document.getElementById('notified-list');
    notifiedList.innerHTML = notified.map((c, index) => `
        <li class="notified-item">
            <div class="notified-info">
                <span><strong>${c.name}</strong> (${c.phone})</span>
                <span class="status-badge">${index === 0 ? 'Opened' : 'Pending'}</span>
            </div>
            <a href="${c.url}" target="_blank" class="btn-manual-send">
                ${index === 0 ? 'Resend' : 'Send Alert'}
            </a>
        </li>
    `).join('');

    // Switch screen and init map
    showScreen('alert-sent');
    initMap(coords.lat, coords.lng);
}

// UI feedback: Flashes and ripples
function triggerVisualFeedback() {
    // Single tap feedback handled by CSS :active
    
    // Viewport red flash
    document.body.classList.add('flash-red');
    setTimeout(() => document.body.classList.remove('flash-red'), 300);

    // Add burst class to button for dramatic ripple
    mainSOSBtn.classList.add('pulse-burst');
    setTimeout(() => mainSOSBtn.classList.remove('pulse-burst'), 1000);
}

// Staggered fade animations logic
// Handled via CSS --delay properties in HTML template
