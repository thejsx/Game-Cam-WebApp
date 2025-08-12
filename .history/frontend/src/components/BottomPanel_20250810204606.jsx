import { useState, useEffect } from "react";
import "../styles/BottomPanel.css";
import useGlobalStore from "../../GlobalStore";

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

export default function BottomPanel({ allItems, updateSelected, onOpenPlayer }) {
  const selectedSettings = useGlobalStore(s => s.selectedSettings);
  const videos           = useGlobalStore(s => s.videos);
  const reverseSettings  = useGlobalStore(s => s.reverseSettings);
  const isMobile = useIsMobile();

  const categories = {
    sites: 'Cam Sites',
    animals: 'Animals',
    actions: 'Actions',
    add_labels: 'Addt\'l Labels'
  };
  const [checkedVideos, setCheckedVideos] = useState([]);
  const [defaultDateRange, setDefaultDateRange] = useState({ start: null, end: null });
  const [sectionHeights, setSectionHeights] = useState({
    sites: 80,
    animals: 80,
    actions: 80,
    add_labels: 80,
    videos: 120
  });

  // Handle vertical drag for mobile resizing
  const handleVerticalDragStart = (section, e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = sectionHeights[section];
    
    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(50, Math.min(500, startHeight + deltaY));
      setSectionHeights(prev => ({ ...prev, [section]: newHeight }));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
 
  const handleChange = (key, entry) => {
    const newSelected = selectedSettings[key].includes(entry)
      ? selectedSettings[key].filter(e => e !== entry)
      : [...selectedSettings[key], entry];
    updateSelected(key, newSelected);
  };

  const handleSelectAllNone = (key) => {
    const currentSelected = selectedSettings[key] || [];
    const allOptions = allItems[key] || [];
    
    // If not all are selected, select all. Otherwise, select none.
    const newSelected = currentSelected.length < allOptions.length ? [...allOptions] : [];
    updateSelected(key, newSelected);
  };

  const resetDateRange = () => {
    updateSelected('start', defaultDateRange.start);
    updateSelected('end', defaultDateRange.end);
  };

  // Save default date range on mount
  useEffect(() => {
    setDefaultDateRange({
      start: selectedSettings.start || null,
      end: selectedSettings.end || null
    });
  }, []);

  console.log("BottomPanel render - video count:", videos ? Object.keys(videos).length : 0);
  console.log('Reverse settings:', reverseSettings);
  return (
    <div className="bottom-panel">
      {Object.entries(categories).map(([k, title]) => (
        <div key={k} className={`filter-list ${k}`}>
          <div className="filter-header">
            <div className="filter-title">{title}</div>
            <button 
              className="filter-button select-all-none"
              onClick={() => handleSelectAllNone(k)}
              title={selectedSettings[k].length < allItems[k].length ? "Select All" : "Select None"}
            >
              {selectedSettings[k].length < allItems[k].length ? "Select All" : "Select None"}
            </button>
          </div>
          <div 
            className="filter-items"
            style={isMobile ? { height: `${sectionHeights[k]}px` } : {}}
          >
            {allItems[k].map(entry =>  {
              // console.log('Greying check:', k, entry, reverseSettings[k]);
              return (
              <div key={`${k}-${entry}`} className={`filter-item ${!reverseSettings[k].includes(entry) ? 'unavailable' : ''}`}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedSettings[k].includes(entry)}
                    onChange={() => handleChange(k, entry)}
                  /> 
                  {entry} 
                </label>
              </div>  );
            })}
          </div>
          <div 
            className="vertical-resize-handle"
            onMouseDown={(e) => handleVerticalDragStart(k, e)}
          />
        </div>
      ))}

      <div className="date-range">
        <div className="date-range-header">
          <div className="date-range-title">Date Range</div>
          <button 
            className="filter-button reset-button"
            onClick={resetDateRange}
            title="Reset to default"
          >
            Reset
          </button>
        </div>
        <div className="date-input">
          <label>Start:</label>
          <input value={selectedSettings.start || ''} onChange={e => updateSelected('start', e.target.value)} type="date" />
        </div>
        <div className="date-input">
          <label>End:</label>
          <input value={selectedSettings.end || ''} onChange={e => updateSelected('end', e.target.value)} type="date" />
        </div>
      </div>

      <div className="videos-section">
        <div className="videos-header">
          <div className="videos-title">Videos ({videos ? Object.keys(videos).length : 0})</div>
          {videos && Object.keys(videos).length > 0 && (
            <button 
              className="filter-button select-all-none"
              onClick={() => {
                const allVideoIds = Object.keys(videos);
                if (checkedVideos.length < allVideoIds.length) {
                  setCheckedVideos(allVideoIds);
                } else {
                  setCheckedVideos([]);
                }
              }}
              title={checkedVideos.length < Object.keys(videos).length ? "Select All" : "Select None"}
            >
              {checkedVideos.length < Object.keys(videos).length ? "Select All" : "Select None"}
            </button>
          )}
        </div>
        <div 
          className="videos-list"
          style={isMobile ? { height: `${sectionHeights.videos}px` } : {}}
        >
          {
            !videos || Object.keys(videos).length === 0 ? <p>No videos available</p> : 
            Object.entries(videos).map(([vid, info],index) => {
              const date = info ? info.time.split('T')[0] : '';
              const displayName = `${index+1}. ${date}`;
              return (
              <div key={vid} className="video-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={checkedVideos.includes(vid)}
                    onChange={() => {
                      if (checkedVideos.includes(vid)) {
                        setCheckedVideos(checkedVideos.filter(v => v !== vid));
                      } else {
                        setCheckedVideos([...checkedVideos, vid]);
                      }
                    }}
                  />
                  <span 
                    className="video-item-name"
                    onDoubleClick={() => onOpenPlayer([vid])}
                    title={vid}
                  >
                    {displayName}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
        <div 
          className="vertical-resize-handle"
          onMouseDown={(e) => handleVerticalDragStart('videos', e)}
        />
        <div className="video-actions">
          {videos && Object.keys(videos).length > 0 && (
            <>
              <button className="videos-button" onClick={() => onOpenPlayer(Object.keys(videos))}>Play All</button>
              <button className="videos-button" onClick={() => {
                if (checkedVideos.length > 0) onOpenPlayer(checkedVideos);
              }}>Play Selected</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}