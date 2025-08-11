// frontend/src/App.jsx
import { useEffect, useState, useCallback } from "react";
import { fetchLabels } from "./api";
import MapPane from "./components/MapPane";
import BottomPanel from "./components/BottomPanel";
import "./styles/App.css";
import useGlobalStore from "./GlobalStore";

export default function App() {
  const { selectedSettings, setSelectedSettings, updateFunction } = useGlobalStore();
  const allItems = {};

  // Initialize all entries and default to all selected once at start
  useEffect(() => {
      const d = fetchLabels()
      setSelectedSettings(d);
      allItems.sites = d.sites;
      allItems.animals = d.animals;
      allItems.actions = d.actions;
      allItems.add_labels = d.add_labels;
      allItems.start = d.start;
      allItems.end = d.end;
    }, []);

  // update videos and reverse settings whenever any selected settings change
  useEffect(() => {
    updateFunction();
  }, [selectedSettings, updateFunction]);

  // Site function for the MapPane to communicate cam site toggles to global state
  const onSiteClick = (name) => {
      const newSites = s.includes(name) ? s.filter(x => x !== name) : [...s, name];
      setSelectedSettings({ sites: newSites });
    };

  // General function to update selected settings in BottomPanel
  const updateSelected = (key, values) => {
    setSelectedSettings({ [key]: values });
  };

  const onOpenPlayer = useCallback((paths) => {
    sessionStorage.setItem("queue", JSON.stringify(paths));
    // Use the full URL with the dev server port for proper routing
    const playerUrl = window.location.origin + "/player";
    window.open(playerUrl, "_blank");
  }, [])

  return (
    <div className="app-container">
      <div className="app-main">
        <MapPane sites={sites} selectedSites={selectedSettings.sites} onSiteClick={onSiteClick} />
      </div>
      {raw && raw.sites && raw.video_labels && (
        <BottomPanel 
          allItems={allItems}
          updateSelected={updateSelected}
          onOpenPlayer={onOpenPlayer}
        />
      )}
    </div>
  );
}