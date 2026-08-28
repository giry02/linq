function fallbackSource() {
  return location.pathname.includes("/mgmt/geofence")
    ? "/dealer/assets/images/live-geofence-fallback.png"
    : "/dealer/assets/images/live-map-fallback.png";
}

const scheduledMaps = new WeakSet();

function replaceMap(map) {
  if (!map || map.dataset.offlineFallback === "true") return;
  const image = document.createElement("img");
  image.src = fallbackSource();
  image.alt = "운영 지도 캡처";
  image.className = "offline-map-fallback";
  if (location.pathname.includes("/mgmt/geofence")) image.classList.add("geofence-fallback");
  map.replaceChildren(image);
  map.dataset.offlineFallback = "true";
}

function applyOfflineMapFallback() {
  const map = document.querySelector("#map");
  if (!map || map.dataset.offlineFallback === "true") return;
  if (map.querySelector(".gm-err-container")) replaceMap(map);
  if (scheduledMaps.has(map)) return;
  scheduledMaps.add(map);
  setTimeout(() => replaceMap(map), 1800);
}

new MutationObserver(applyOfflineMapFallback).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
applyOfflineMapFallback();
