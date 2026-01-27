let map;
let userMarker;
let lastLatLng = null;
let isUserInteracting = false;
let busMarkers = [];

const BUS_STOP_MAX = 30;
const BUS_STOP_MIN_ZOOM = 14;

document.addEventListener("DOMContentLoaded", () => {
  if (APP_ICON_BASE64) {
    document.getElementById("appIcon").src = APP_ICON_BASE64;
  }

  initMap();
  setupButtons();
  startLocationUpdate();
});

// ===== マップ初期化 =====
function initMap() {
  map = L.map("map").setView([34.39756, 132.47532], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  userMarker = L.circleMarker([0, 0], {
    radius: 10,
    color: "#1976d2",
    fillColor: "#2196f3",
    fillOpacity: 1
  }).addTo(map);

  map.on("dragstart zoomstart", () => {
    isUserInteracting = true;
  });

  map.on("moveend zoomend", () => {
    if (lastLatLng) {
      updateBusStops();
    }
  });
}

// ===== ボタン =====
function setupButtons() {
  document.getElementById("locateBtn").onclick = () => {
    if (lastLatLng) {
      map.setView(lastLatLng, 16);
      isUserInteracting = false;
    }
  };

  const toggleBtn = document.getElementById("mapToggle");
  const container = document.getElementById("mapContainer");

  toggleBtn.onclick = () => {
    container.classList.toggle("closed");
    toggleBtn.textContent =
      container.classList.contains("closed") ? "🔽" : "🔼";

    setTimeout(() => map.invalidateSize(), 300);
  };
}

// ===== 現在地更新（15秒） =====
function startLocationUpdate() {
  updateLocation();
  setInterval(updateLocation, 15000);
}

function updateLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    lastLatLng = [
      pos.coords.latitude,
      pos.coords.longitude
    ];

    userMarker.setLatLng(lastLatLng);

    if (!isUserInteracting) {
      map.setView(lastLatLng, map.getZoom());
    }

    updateBusStops();
  });
}

// ===== バス停（画面内 & 最大30） =====
function updateBusStops() {
  // 縮尺が広すぎる場合は非表示
  if (map.getZoom() < BUS_STOP_MIN_ZOOM) {
    clearBusStops();
    return;
  }

  const bounds = map.getBounds();

  clearBusStops();

  const visibleStops = BUS_STOPS.filter(stop =>
    bounds.contains([stop.lat, stop.lng])
  ).slice(0, BUS_STOP_MAX);

  visibleStops.forEach(stop => {
    const marker = L.circleMarker([stop.lat, stop.lng], {
      radius: 5,
      color: "#333",
      fillColor: "#ffcc00",
      fillOpacity: 1
    })
      .addTo(map)
      .bindPopup(stop.name);

    busMarkers.push(marker);
  });
}

function clearBusStops() {
  busMarkers.forEach(m => map.removeLayer(m));
  busMarkers = [];
}
