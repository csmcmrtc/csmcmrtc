# RESCUE — Women's Safety Emergency Platform 🚨

RESCUE is a complete, mobile-first, and highly responsive web application designed for women's safety. It provides a single-tap SOS activation system that instantly notifies trusted contacts with live location details and finds nearby help without any backend dependencies.

---

## ✨ Features

### 1. High-Priority SOS Button
- **Single Tap Activation**: No holding or confirmation dialogs; every second counts.
- **Immediate Feedback**: Button scales down on click, triggers a viewport-wide red flash, and initiates a dramatic ripple burst.
- **Auto-Dispatch**: Sends alerts via **WhatsApp** (online) or **SMS** (offline) to all trusted contacts.
- **Manual Fallback**: If GPS fails, the app transitions to the map screen where you can drop a manual pin to set your position and find nearby help.
- **5-Second Cancel Window**: A shrinking countdown bar appears after firing to allow a quick reset if triggered accidentally.

### 2. Location & Address Handling
- **Real-time GPS**: Captures high-accuracy coordinates using the Browser Geolocation API.
- **Reverse Geocoding**: Automatically converts coordinates into human-readable addresses via the **Nominatim (OpenStreetMap)** API.
- **Fallback**: Caches the last known location in `LocalStorage` if GPS is temporarily unavailable.

### 3. Integrated Safety Map
- **Nearby Police Finder**: Queries the **Overpass API** in real-time to locate police stations within a 2km radius.
- **Interactive Markers**: Displays blue shield icons for police stations and a pulsating red pin for the user.
- **Safety Lines**: Draws dashed lines from the user to each station with distance information and direct-dial buttons.

### 4. Trusted Contacts Manager
- **Privacy-First**: No backend; all contact data is stored securely in your browser's `LocalStorage`.
- **Relationship Labeling**: Categorize contacts as Family, Friend, or Colleague.
- **Smart Badges**: Displays connectivity status ("WhatsApp Ready" vs "SMS Ready").

### 5. Progressive Web App (PWA)
- **Installable**: Add RESCUE to your phone's home screen for instant access.
- **Offline Capable**: Caches core assets (CSS, JS, Fonts) using a Service Worker to ensure the SOS works in areas with poor connectivity.

---

## 🛠️ Tech Stack
- **Languages**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Mapping**: [Leaflet.js](https://leafletjs.com/) with OpenStreetMap.
- **Data**: [Overpass API](https://overpass-turbo.eu/) (Police data) & [Nominatim](https://nominatim.org/) (Address data).
- **Icons**: Custom SVG + Generated PNGs for PWA.
- **Storage**: `window.localStorage`.

---

## 🎨 Design System
- **Fonts**: 
  - `Cormorant Garamond` (Headings)
  - `DM Sans` (Body)
- **Colors**:
  - Primary (SOS): `#C0392B` (Crimson)
  - Background: `#FDFAF8` (Ivory)
  - Indicators: `#27AE60` (Safe Green)
- **UI Styles**: Glassmorphism navigation, focus-visible accessibility rings, and smooth keyframe animations.

---

## 📂 File Structure
```text
rescue/
├── index.html          # Core application & screen switcher
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker for asset caching
├── css/
│   └── style.css       # Design tokens & animation registry
├── js/
│   ├── sos.js          # SOS activation & button state logic
│   ├── location.js     # Geolocation & Nominatim integration
│   ├── contacts.js     # LocalStorage CRUD operations
│   ├── alert.js        # WhatsApp & SMS dispatch engine
│   └── map.js          # Leaflet map & Overpass API caller
└── assets/icons/       # App icons (192x192 & 512x512)
```

---

## 🚀 Getting Started

### Quick Start
1. Clone or download the repository.
2. Open `index.html` in any modern web browser.

### Local Development (Recommended for PWA)
To test PWA features and the Service Worker, run a local development server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .
```

---

## ⚠️ Important Privacy Note
RESCUE is a **100% client-side application**. Your location history, contact names, and phone numbers are never transmitted to any third-party server. All data remains exclusively on your device within your browser's `LocalStorage`.

---

## 📞 Emergency Quick Dial
These links are always visible at the top of the app:
- **Police**: 100
- **Women Helpline**: 1091
- **Emergency**: 112
