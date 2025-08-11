import { useState } from "react";
import "../styles/BottomPanel.css";
import useGlobalStore from "../../GlobalStore";

export default function BottomPanel({ allItems, updateSelected, onOpenPlayer }) {
  const { selectedSettings, videos, reverseSettings } = useGlobalStore();
  const categories = {
    sites: 'Cam Sites',
    animals: 'Animals',
    actions: 'Actions',
    add_labels: 'Addt\'l Labels'
  };
  const [checkedVideos, setCheckedVideos] = useState([]);
 
  const handleChange = (key, entry) => {
    const newSelected = selectedSettings[key].includes(entry)
      ? selectedSettings[key].filter(e => e !== entry)
      : [...selectedSettings[key], entry];
    updateSelected(key, newSelected);
  };

  return (
    <div className="bottom-panel">
      {Object.entries(categories).map(([key, title]) => (
        <div className={`filter-list ${key}`}>
          <div className="filter-title">{title}</div>
          <div className="filter-items">
            {console.log(key);
            console.log(allItems)}
            {allItems[key].map(entry => (
              <div key={entry} className={`filter-item ${!reverseSettings[key].includes(entry) ? 'unavailable' : ''}`}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedSettings[key].includes(entry)}
                    onChange={() => handleChange(key, entry)}
                  /> 
                  {entry} 
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="date-range">
        <div className="date-range-title">Date Range</div>
        <div className="date-input">
          <label>Start:</label>
          <input value={selectedSettings.start} onChange={e => handleChange('start', e.target.value)} type="date" />
        </div>
        <div className="date-input">
          <label>End:</label>
          <input value={selectedSettings.end} onChange={e => handleChange('end', e.target.value)} type="date" />
        </div>
      </div>

      <div className="videos-section">
        <div className="videos-header">
          <div className="videos-title">Videos ({videos.length})</div>
          {videos.length > 0 && (
            <>
              <button className="videos-button" onClick={() => onOpenPlayer(Object.keys(videos))}>Play All</button>
              <button className="videos-button" onClick={() => {
                if (checkedVideos.length > 0) onOpenPlayer(checkedVideos);
              }}>Play Selected</button>
            </>
          )}
        </div>
        <div className="videos-list">
          {videos.length === 0 ? <p>No videos available</p> : 
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
      </div>
    </div>
  );
}