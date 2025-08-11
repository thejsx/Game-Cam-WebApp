// frontend/src/App.jsx
import { useEffect, useState } from "react";
import { fetchLabels } from "./api";
import MapPane from "./components/MapPane";
import BottomPanel from "./components/BottomPanel";

export default function App() {
  const [raw, setRaw] = useState(null);
  const [sites, setSites] = useState(null);
  const [selectedSites, setSelectedSites] = useState([]);

  useEffect(() => { fetchLabels().then(d => { setRaw(d); setSites(d.sites); }); }, []);

  function onFilterChange(p) {
    const q = { ...p, sites: selectedSites.join(',') };
    fetchLabels(q).then(d => setRaw(d));
  }

  function onSiteClick(name) {
    setSelectedSites(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);
  }

  function onOpenPlayer(paths) {
    sessionStorage.setItem("queue", JSON.stringify(paths));
    window.open("/player", "_blank");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ flex: 1 }}>
        <MapPane sites={sites} selectedSites={selectedSites} onSiteClick={onSiteClick} />
      </div>
      {raw && raw.sites && raw.video_labels && (
        <BottomPanel data={raw} onFilterChange={onFilterChange} onOpenPlayer={onOpenPlayer} />
      )}
    </div>
  );
}
