// frontend/src/App.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchLabels } from "./api";
import MapPane from "./components/MapPane";
import BottomPanel from "./components/BottomPanel";
import "./styles/App.css";
import useGlobalStore from "../GlobalStore";

// Global configuration
const MAX_VIDEOS_LIMIT = 100; // Configurable limit for video playback

export default function App() {
  const selectedSettings   = useGlobalStore(s => s.selectedSettings);
  const setSelectedSettings= useGlobalStore(s => s.setSelectedSettings);
  const updateFunction     = useGlobalStore(s => s.updateFunction);
  const setVideos          = useGlobalStore(s => s.setVideos);
  const setReverseSettings = useGlobalStore(s => s.setReverseSettings);
  const [allItems, setAllItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [sites, setSites] = useState({});
  const [bottomPanelHeight, setBottomPanelHeight] = useState(300);
  const isDragging = useRef(false);

  // Initialize all entries and default to all selected once at start
  useEffect(() => {
    const initializeData = async () => {
      console.log("Fetching initial labels...");
      const d = await fetchLabels({});
      console.log("Fetched labels:", d);
      setSelectedSettings({
        sites: Object.keys(d.sites) || [],
        animals: d.animals || [],
        actions: d.actions || [],
        add_labels: d.add_labels || [],
        start: d.start || null,
        end: d.end || null,
        restricted: d.restricted !== undefined ? d.restricted : true
      });
      setAllItems({
        sites: Object.keys(d.sites) || [],
        animals: d.animals || [],
        actions: d.actions || [],
        add_labels: d.add_labels || [],
        start: d.start,
        end: d.end
      });
      setVideos(d.video_labels || {});

      setReverseSettings({
        sites: Object.keys(d.sites) || [],
        animals: d.animals || [],
        actions: d.actions || [],
        add_labels: d.add_labels || []
      });

      setSites(d.sites || {});

    }
    initializeData();

    }, []);

  // update videos and reverse settings whenever any selected settings change
  useEffect(() => {
    isLoading ? (Object.keys(selectedSettings).length > 0 ? setIsLoading(false) : null) : updateFunction();
  }, [selectedSettings]);

  // Site function for the MapPane to communicate cam site toggles to global state
  const onSiteClick = useCallback((name) => {
    const { selectedSettings } = useGlobalStore.getState();
    const s = selectedSettings.sites || [];
    const next = s.includes(name) ? s.filter(x => x !== name) : [...s, name];
    setSelectedSettings({ sites: next });
  }, [setSelectedSettings]);

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

  // Function to open the video player with selected videos
  const onOpenPlayer = useCallback((paths) => {
    // Check if too many videos are selected
    if (paths.length > MAX_VIDEOS_LIMIT) {
      const message = `Only ${MAX_VIDEOS_LIMIT} or fewer videos can be played at a time.\nYou have selected ${paths.length} videos.\n\nWould you like to play the first ${MAX_VIDEOS_LIMIT} videos?`;
      
      if (window.confirm(message)) {
        paths = paths.slice(0, MAX_VIDEOS_LIMIT);
      } else {
        return; // User cancelled
      }
    }

    // paths are a list of video IDs, update global state with object of paths: values
    const { videos } = useGlobalStore.getState();
    const selectedVideos = Object.fromEntries(Object.entries(videos).filter(([vid]) => paths.includes(vid)));
    localStorage.setItem("selectedVideos", JSON.stringify(selectedVideos));
 

    // Use the full URL with the dev server port for proper routing
    const playerUrl = window.location.origin + "/player";
    window.open(playerUrl, "_blank");
  }, []);

  // Handle resizing of bottom panel
  const handleMouseDown = (e) => {
    isDragging.current = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const newHeight = window.innerHeight - e.clientY;
      setBottomPanelHeight(Math.min(Math.max(newHeight, 200), window.innerHeight * 0.7));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const isReady = !isLoading && Object.keys(allItems).length > 0 && Object.keys(sites).length > 0;
  return (
    isReady ? (
      <div className="app-container">
        <div className="app-main" style={{ height: `calc(100vh - ${bottomPanelHeight}px)` }}>
          <MapPane sites={sites} selectedSites={selectedSettings.sites} onSiteClick={onSiteClick} />
        </div>

        <div className="resize-handle" onMouseDown={handleMouseDown} />

        <div className="bottom-panel-wrapper" style={{ height: `${bottomPanelHeight}px` }}>
          <BottomPanel
            allItems={allItems}
            updateSelected={updateSelected}
            onOpenPlayer={onOpenPlayer}
          />
        </div>
      </div>
    ) :
    ( <div className="loading-message">Loading data...</div> )
  );
}