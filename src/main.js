
let map;
let userMarker;

function initMap(lat, lng) {
  map = L.map("map").setView([lat, lng], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  userMarker = L.marker([lat, lng]).addTo(map)
    .bindPopup("現在地")
    .openPopup();
}

function locateUser() {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (!map) {
        initMap(lat, lng);
      } else {
        map.setView([lat, lng], 16);
        userMarker.setLatLng([lat, lng]);
      }
    },
    () => {
      alert("位置情報を取得できません");
    }
  );
}

document.getElementById("locateBtn").addEventListener("click", locateUser);

// 初回ロード時
locateUser();