// frontend/src/App.jsx
import { useEffect, useState, useCallback } from "react";
import { fetchLabels } from "./api";
import MapPane from "./components/MapPane";
import BottomPanel from "./components/BottomPanel";
import "./styles/App.css";

export default function App() {
  const [raw, setRaw] = useState(null);
  const [sites, setSites] = useState(null);
  const [animals, setAnimals] = useState(null);
  const [actions, setActions] = useState(null);
  const [addLabels, setAddLabels] = useState(null);
  const [selectedSites, setSelectedSites] = useState([]);
  const [filterParams, setFilterParams] = useState({});

  useEffect(() => { 
    fetchLabels().then(d => { 
      setRaw(d); 
      setSites(d.sites);
      // Initialize all sites as selected
      if (d.sites) {
        const allSiteNames = Object.values(d.sites).map(s => s.site);
        setSelectedSites(allSiteNames);
        const allAnimalNames = ['none', ...Object.values(d.sorted
      }
    }); 
  }, []);

  const onFilterChange = useCallback((p) => {
    setFilterParams(p);
    const q = { ...p, sites: p.sites.join(',') };
    fetchLabels(q).then(d => setRaw(d));
  }, [])

  const onSiteClick = useCallback((name) => {
    setSelectedSites(s => {
      const newSites = s.includes(name) ? s.filter(x => x !== name) : [...s, name];
      // Trigger filter update when sites change from map
      if (filterParams) {
        const updatedParams = { ...filterParams, sites: newSites };
        const q = { ...updatedParams, sites: newSites.join(',') };
        fetchLabels(q).then(d => setRaw(d));
      }
      return newSites;
    });
  }, [filterParams])

  const onOpenPlayer = useCallback((paths) => {
    sessionStorage.setItem("queue", JSON.stringify(paths));
    // Use the full URL with the dev server port for proper routing
    const playerUrl = window.location.origin + "/player";
    window.open(playerUrl, "_blank");
  }, [])

  return (
    <div className="app-container">
      <div className="app-main">
        <MapPane sites={sites} selectedSites={selectedSites} onSiteClick={onSiteClick} />
      </div>
      {raw && raw.sites && raw.video_labels && (
        <BottomPanel 
          data={raw} 
          onFilterChange={onFilterChange} 
          onOpenPlayer={onOpenPlayer}
          selectedSites={selectedSites}
          onSiteSelectionChange={setSelectedSites}
        />
      )}
    </div>
  );
}