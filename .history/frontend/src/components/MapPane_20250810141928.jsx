// frontend/src/components/MapPane.jsx
import { useEffect, useRef } from "react";
import "../styles/MapPane.css";
import useGlobalStore from "../../GlobalStore";

export default function MapPane({ sites, onSiteClick }) {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const center = [35.8978028, -105.7205639];
  const zoom = 13;
  const { selectedSettings } = useGlobalStore();
  const selectedSites = selectedSettings.sites || [];

  useEffect(() => {
    if (mapRef.current) return;
    const L = window.L;
    const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { maxZoom: 17 });
    const osm  = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 });
    const sat  = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 });

    const map = L.map("map", { center, zoom, layers: [topo] });
    L.control.layers({ "Topo Map": topo, "OpenStreetMap": osm, "Satellite": sat }).addTo(map);
    L.Control.Recenter = L.Control.extend({
      onAdd: function() {
        const div = L.DomUtil.create('div','leaflet-bar leaflet-control');
        const a = L.DomUtil.create('a','recenter-btn',div); 
        a.href="#"; 
        a.innerHTML="Recenter"; 
        a.onclick = () => { recenter(map); return false; };
        return div;
      }
    });
    L.control.recenter = function(opts){ return new L.Control.Recenter(opts); };
    L.control.recenter({ position: 'bottomleft' }).addTo(map);
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!mapRef.current || !sites) return;
    const L = window.L;
    const m = markersRef.current;
    Object.values(m).forEach(marker => marker.remove());
    markersRef.current = {};
    Object.keys(sites).forEach(site => {
      const gps = sites[site];
      const lat = gps[0], lon = gps[1], name = site;
      const marker = L.circleMarker([lat, lon], { radius: 8, color: "green", fillColor: "blue", fillOpacity: 1.0 })
        .addTo(mapRef.current).bindTooltip(name, { direction: "top", opacity: 0.9 });
      marker.on("click", () => onSiteClick && onSiteClick(name));
      markersRef.current[name] = marker;
    });
    recenter(mapRef.current);
  }, [sites]);

  useEffect(() => {
    const { selectedSettings } = useGlobalStore.getState();
    const newSelectedSites = selectedSettings.sites || [];
    console.log("markersRef:", markersRef.current);
    const m = markersRef.current;
    Object.keys(m).forEach(name => {
      if (newSelectedSites.includes(name)) m[name].setStyle({ color: "green", fillColor: "blue" });
      else m[name].setStyle({ color: "lightgray", fillColor: "red" });
    });
  }, [selectedSites]);

  function recenter(map) {
    const m = markersRef.current;
    const picks = selectedSites.map(n => m[n]).filter(Boolean).map(marker => marker.getLatLng());
    if (picks.length) map.fitBounds(picks, { padding: [50,50], maxZoom: 17 }); else map.setView(center, zoom);
  }

  return <div id="map" className="map-container" />;
}