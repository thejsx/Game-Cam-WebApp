import { useState, useEffect, memo, useCallback, useLayoutEffect, useRef } from "react";
import "../styles/BottomPanel.css";
import useGlobalStore from "../../GlobalStore";
import VirtualVideoList from "./VirtualVideoList";
import useIsMobile from "../useIsMobile";

// Memoized filter item
const FilterItem = memo(({ category, entry, isChecked, isUnavailable, onChange }) => (
  <div className={`filter-item ${isUnavailable ? 'unavailable' : ''}`}>
    <label>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
      />
      {entry}
    </label>
  </div>
));

function BottomPanel({ allItems, updateSelected, onOpenPlayer }) {
  const selectedSettings = useGlobalStore(s => s.selectedSettings);
  const videos           = useGlobalStore(s => s.videos);
  const reverseSettings  = useGlobalStore(s => s.reverseSettings);
  const isMobile = useIsMobile();

  const categories = {
    sites: 'Cam Sites',
    animals: 'Animals',
    actions: 'Actions',
    add_labels: "Addt'l Labels",
  };

  const [checkedVideos, setCheckedVideos] = useState([]);
  const [defaultDateRange, setDefaultDateRange] = useState({ start: null, end: null });
  const [sectionHeights, setSectionHeights] = useState(() => ({
    sites:      window.innerWidth <= 768 ? 175 : 200,
    animals:    window.innerWidth <= 768 ? 165 : 200,
    actions:    window.innerWidth <= 768 ? 165 : 200,
    add_labels: window.innerWidth <= 768 ? 140 : 200,
    videos:     window.innerWidth <= 768 ? 225 : 250
  }));

  // For mobile: measure widest list and apply a shared width to all lists (shrink-wrap to widest)
  const filtersScrollerRef = useRef(null);
  useLayoutEffect(() => {
    if (!isMobile || !filtersScrollerRef.current) return;
    const container = filtersScrollerRef.current;
    const measure = () => {
      const lists = Array.from(container.querySelectorAll('[data-filter-list]'));
      if (!lists.length) return;
      const max = Math.ceil(
        Math.max(
          ...lists.map(el => {
            const clone = el.cloneNode(true);
            clone.style.width = 'max-content';
            clone.style.position = 'absolute';
            clone.style.visibility = 'hidden';
            clone.style.maxWidth = 'unset';
            document.body.appendChild(clone);
            const w = clone.getBoundingClientRect().width;
            clone.remove();
            return w;
          })
        )
      );
      container.style.setProperty('--filters-max-list-width', `${max}px`);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isMobile]);

  // drag-to-resize sections (mobile)
  const handleVerticalDragStart = (section, e) => {
    e.preventDefault();
    e.stopPropagation();
    const isTouch = e.type.includes('touch');
    const startY = isTouch ? e.touches[0].clientY : e.clientY;
    const startHeight = sectionHeights[section];

    const handleMove = (moveEvent) => {
      moveEvent.preventDefault();
      const currentY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const deltaY = currentY - startY;
      const newHeight = Math.max(80, Math.min(400, startHeight + deltaY));
      setSectionHeights(prev => ({ ...prev, [section]: newHeight }));
    };

    const handleEnd = () => {
      if (isTouch) {
        document.removeEventListener('touchmove', handleMove, { passive: false });
        document.removeEventListener('touchend', handleEnd);
      } else {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
      }
    };

    if (isTouch) {
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    } else {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }
  };

  const handleChange = useCallback((key, entry) => {
    const newSelected = selectedSettings[key].includes(entry)
      ? selectedSettings[key].filter(e => e !== entry)
      : [...selectedSettings[key], entry];
    updateSelected(key, newSelected);
  }, [selectedSettings, updateSelected]);

  const handleSelectAllNone = useCallback((key) => {
    const currentSelected = selectedSettings[key] || [];
    const allOptions = allItems[key] || [];
    const newSelected = currentSelected.length < allOptions.length ? [...allOptions] : [];
    updateSelected(key, newSelected);
  }, [selectedSettings, allItems, updateSelected]);

  const handleClearEmpty = useCallback((key) => {
    const availableItems = reverseSettings[key] || [];
    const currentSelected = selectedSettings[key] || [];
    const newSelected = currentSelected.filter(item => availableItems.includes(item));
    updateSelected(key, newSelected);
  }, [reverseSettings, selectedSettings, updateSelected]);

  const resetDateRange = useCallback(() => {
    updateSelected('start', defaultDateRange.start);
    updateSelected('end', defaultDateRange.end);
  }, [defaultDateRange, updateSelected]);

  useEffect(() => {
    setDefaultDateRange({
      start: selectedSettings.start || null,
      end: selectedSettings.end || null
    });
  }, []); // intentional once

  // ---------- RENDER ----------
  // Desktop: Filters (left) + Videos (right) - side-by-side
  // Mobile:  Hint (top), Videos (top), then Filters (in a scroll window)
  return (
    <div className={`bottom-panel ${isMobile ? 'is-mobile' : 'is-desktop'}`}>
      {isMobile ? (
        <>
          {/* HINT ABOVE VIDEOS ON MOBILE */}
          <div className="mobile-filter-hint">
            Scroll down to filter options to narrow down the video list
          </div>

          {/* VIDEOS (top on mobile) */}
          <div className="mobile-row">
            <div className="mobile-controls">
              <div className="mobile-title">Videos ({videos ? Object.keys(videos).length : 0})</div>
              {videos && Object.keys(videos).length > 0 && (
                <>
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
                    title={checkedVideos.length < (videos ? Object.keys(videos).length : 0) ? "Select All" : "Select None"}
                  >
                    {checkedVideos.length < (videos ? Object.keys(videos).length : 0) ? "Select All" : "Select None"}
                  </button>
                  <button className="videos-button" onClick={() => onOpenPlayer(Object.keys(videos))}>Play All</button>
                  <button
                    className="videos-button"
                    onClick={() => {
                      if (checkedVideos.length > 0) onOpenPlayer(checkedVideos);
                    }}
                    disabled={checkedVideos.length === 0}
                  >
                    Play Selected
                  </button>
                </>
              )}
            </div>

            <div
              className="mobile-list-container"
              style={{ height: `${sectionHeights.videos}px` }}
            >
              <VirtualVideoList
                videos={videos || {}}
                checkedVideos={checkedVideos}
                setCheckedVideos={setCheckedVideos}
                onOpenPlayer={onOpenPlayer}
                height={sectionHeights.videos}
              />
            </div>

            <div
              className="vertical-resize-handle"
              onMouseDown={(e) => handleVerticalDragStart('videos', e)}
              onTouchStart={(e) => handleVerticalDragStart('videos', e)}
            />
          </div>

          {/* FILTERS (each in its own row with controls on left) */}
          {Object.entries(categories).map(([k, title]) => (
            <div key={k} className="mobile-row">
              <div className="mobile-controls">
                <div className="mobile-title">{title}</div>
                <button
                  className="filter-button select-all-none"
                  onClick={() => handleSelectAllNone(k)}
                  title={selectedSettings[k].length < allItems[k].length ? "Select All" : "Select None"}
                >
                  {selectedSettings[k].length < allItems[k].length ? "Select All" : "Select None"}
                </button>
                {k === 'sites' && (
                  <button
                    className="filter-button clear-empty"
                    onClick={() => handleClearEmpty(k)}
                    title="Unselect sites that have no videos in the current filter"
                  >
                    Clear Empty
                  </button>
                )}
              </div>

              <div
                className="mobile-list-container"
                style={{ height: `${sectionHeights[k]}px` }}
              >
                {allItems[k].map(entry => (
                  <FilterItem
                    key={`${k}-${entry}`}
                    category={k}
                    entry={entry}
                    isChecked={selectedSettings[k].includes(entry)}
                    isUnavailable={!reverseSettings[k].includes(entry)}
                    onChange={() => handleChange(k, entry)}
                  />
                ))}
              </div>

              <div
                className="vertical-resize-handle"
                onMouseDown={(e) => handleVerticalDragStart(k, e)}
                onTouchStart={(e) => handleVerticalDragStart(k, e)}
              />
            </div>
          ))}

          {/* DATE RANGE */}
          <div className="mobile-row">
            <div className="mobile-controls">
              <div className="mobile-title">Date Range</div>
              <button
                className="filter-button reset-button"
                onClick={resetDateRange}
                title="Reset to default"
              >
                Reset
              </button>
            </div>

            <div className="mobile-list-container date-inputs">
              <div className="date-input">
                <label>Start:</label>
                <input
                  value={selectedSettings.start || ''}
                  onChange={e => updateSelected('start', e.target.value)}
                  type="date"
                />
              </div>
              <div className="date-input">
                <label>End:</label>
                <input
                  value={selectedSettings.end || ''}
                  onChange={e => updateSelected('end', e.target.value)}
                  type="date"
                />
              </div>
            </div>

            <div className="vertical-spacer" />
          </div>
        </>
      ) : (
        // DESKTOP: horizontal layout with all filters and videos in a row
        <>
          {Object.entries(categories).map(([k, title]) => (
            <div key={k} className={`filter-list ${k}`} data-filter-list>
              <div className="filter-header">
                <div className="filter-title">{title}</div>
                <div className="filter-buttons">
                  <button
                    className="filter-button select-all-none"
                    onClick={() => handleSelectAllNone(k)}
                    title={selectedSettings[k].length < allItems[k].length ? "Select All" : "Select None"}
                  >
                    {selectedSettings[k].length < allItems[k].length ? "Select All" : "Select None"}
                  </button>
                  {k === 'sites' && (
                    <button
                      className="filter-button clear-empty"
                      onClick={() => handleClearEmpty(k)}
                      title="Unselect sites that have no videos in the current filter"
                    >
                      Clear Empty
                    </button>
                  )}
                </div>
              </div>

              <div className="filter-items">
                {allItems[k].map(entry => (
                  <FilterItem
                    key={`${k}-${entry}`}
                    category={k}
                    entry={entry}
                    isChecked={selectedSettings[k].includes(entry)}
                    isUnavailable={!reverseSettings[k].includes(entry)}
                    onChange={() => handleChange(k, entry)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="date-range" data-filter-list>
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
              <input
                value={selectedSettings.start || ''}
                onChange={e => updateSelected('start', e.target.value)}
                type="date"
              />
            </div>
            <div className="date-input">
              <label>End:</label>
              <input
                value={selectedSettings.end || ''}
                onChange={e => updateSelected('end', e.target.value)}
                type="date"
              />
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
                  title={checkedVideos.length < (videos ? Object.keys(videos).length : 0) ? "Select All" : "Select None"}
                >
                  {checkedVideos.length < (videos ? Object.keys(videos).length : 0) ? "Select All" : "Select None"}
                </button>
              )}
            </div>

            <div className="videos-list">
              <VirtualVideoList
                videos={videos || {}}
                checkedVideos={checkedVideos}
                setCheckedVideos={setCheckedVideos}
                onOpenPlayer={onOpenPlayer}
              />
            </div>

            <div className="video-actions">
              {videos && Object.keys(videos).length > 0 && (
                <>
                  <button className="videos-button" onClick={() => onOpenPlayer(Object.keys(videos))}>Play All</button>
                  <button
                    className="videos-button"
                    onClick={() => {
                      if (checkedVideos.length > 0) onOpenPlayer(checkedVideos);
                    }}
                  >
                    Play Selected
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(BottomPanel);
