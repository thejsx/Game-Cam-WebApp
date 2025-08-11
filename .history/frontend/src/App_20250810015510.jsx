// frontend/src/App.jsx
import { useEffect, useState, useCallback } from "react";
import { fetchLabels } from "./api";
import MapPane from "./components/MapPane";
import BottomPanel from "./components/BottomPanel";
import "./styles/App.css";
import useGlobalStore from "../GlobalStore";

export default function App() {
  const { selectedSettings, setSelectedSettings, updateFunction } = useGlobalStore();
  const [allItems, setAllItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize all entries and default to all selected once at start
  useEffect(() => {
      console.log("Fetching initial labels...");
      const d = fetchLabels();
      setSelectedSettings(d);
      setAllItems({
        sites: d.sites,
        animals: d.animals,
        actions: d.actions,
        add_labels: d.add_labels,
        start: d.start,
        end: d.end
      });
      setIsLoading(false);

    }, []);

  // update videos and reverse settings whenever any selected settings change
  useEffect(() => {
    updateFunction();
  }, [selectedSettings, updateFunction]);

  // Site function for the MapPane to communicate cam site toggles to global state
  const onSiteClick = (name) => {
      const s = selectedSettings.sites;
      const newSites = s.includes(name) ? s.filter(x => x !== name) : [...s, name];
      setSelectedSettings({ sites: newSites });
    };

  // General function to update selected settings in BottomPanel
  const updateSelected = (key, values) => {
    setSelectedSettings({ [key]: values });
  };

  // Keystroke listener to toggle restricted mode (ctrl + shift + r)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === "r") {
        event.preventDefault();
        // Toggle restricted mode
        updateSelected('restricted', !selectedSettings.restricted);
        console.log("Restricted mode toggled:", !selectedSettings.restricted);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const onOpenPlayer = useCallback((paths) => {
    sessionStorage.setItem("queue", JSON.stringify(paths));
    // Use the full URL with the dev server port for proper routing
    const playerUrl = window.location.origin + "/player";
    window.open(playerUrl, "_blank");
  }, []);

  return (
    isLoading ? (
      <div className="loading-message">Loading data...</div>
      ) : (
      <div className="app-container">
        <div className="app-main">
          <MapPane sites={allItems.sites} selectedSites={selectedSettings.sites} onSiteClick={onSiteClick} />
        </div>

        <BottomPanel
          allItems={allItems}
          updateSelected={updateSelected}
          onOpenPlayer={onOpenPlayer}
        />
      </div>
    )
  );
}