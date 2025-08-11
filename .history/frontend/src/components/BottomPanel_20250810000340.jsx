import { useState, useEffect, useMemo, use } from "react";
import "../styles/BottomPanel.css";
import useGlobalStore from "../GlobalStore";

export default function BottomPanel({ allItems, updateSelected, onOpenPlayer }) {
  const { selectedSettings, videos, reverseSettings } = useGlobalStore();
  const categories = {
    sites: 'Cam Sites',
    animals: 'Animals',
    actions: 'Actions',
    add_labels: 'Addt\'l Labels'
  };
 
  const handleChange = (key, entry) => {
    const newSelected = selectedSettings[key].includes(entry)
      ? selectedSettings[key].filter(e => e !== entry)
      : [...selectedSettings[key], entry];
    updateSelected(key, newSelected);
  };

  return (
    <div className="bottom-panel">
      {Object.entries(categories).map(([key, title]) => {
        <div className={`filter-list ${title}`}>
          <div className="filter-title">{title}</div>
          <div className="filter-items">
            {allItems[key].map(entry => {
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
            })}
          </div>
        </div>
      })}
      
      <div className="date-range">
        <div className="date-range-title">Date Range</div>
        <div className="date-input">
          <label>Start:</label>
          <input value={start} onChange={e => setStart(e.target.value)} type="date" />
        </div>
        <div className="date-input">
          <label>End:</label>
          <input value={end} onChange={e => setEnd(e.target.value)} type="date" />
        </div>
      </div>
      <div className="videos-section">
        <div className="videos-header">
          <div className="videos-title">Videos ({videos.length})</div>
          {videos.length > 0 && (
            <>
              <button className="videos-button" onClick={() => onOpenPlayer(videos)}>Play All</button>
              <button className="videos-button" onClick={() => {
                const selected = videos.filter((_, i) => {
                  const checkbox = document.getElementById(`video-check-${i}`);
                  return checkbox && checkbox.checked;
                });
                if (selected.length > 0) onOpenPlayer(selected);
              }}>Play Selected</button>
            </>
          )}
        </div>
        <div className="videos-list">
          {videos.map((v,i) => {
            const videoInfo = data.video_labels && data.video_labels[v];
            const date = videoInfo ? videoInfo.time.split('T')[0] : '';
            const displayName = `${i+1}. ${date}`;
            return (
              <div key={v} className="video-item">
                <label>
                  <input 
                    type="checkbox" 
                    id={`video-check-${i}`}
                  />
                  <span 
                    className="video-item-name"
                    onDoubleClick={() => onOpenPlayer([v])} 
                    title={v}
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