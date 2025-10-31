import { useEffect, useMemo, useState, useRef } from 'react';
import '../styles/Player.css';
import { buildVideoUrl } from '../api.js';
import useIsMobile from '../useIsMobile';
import { parseDt } from '../filterHelpers';

// Format date as "January 15, 2024"
function formatDate(dateStr) {
  const date = parseDt(dateStr);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Format date and time as "January 15, 2024 3:45 p.m."
function formatDateTime(dateStr) {
  const date = parseDt(dateStr);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
  hours = hours % 12 || 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${hours}:${minutesStr} ${ampm}`;
}

export default function Player() {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isQueueCollapsed, setIsQueueCollapsed] = useState(false);
  const [queueWidth, setQueueWidth] = useState(300);
  const [playbackMode, setPlaybackMode] = useState('continuous');
  const [seekTime, setSeekTime] = useState(3);
  const [queueHeight, setQueueHeight] = useState(175); // Default height in pixels
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile(820); // Use consistent breakpoint
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const queueRef = useRef(null);
  const isDraggingQueueRef = useRef(false);
  const dragStartYRef = useRef(0);
  const startOffsetRef = useRef(0);

  // Load videos from localStorage (set by App.jsx)
  useEffect(() => {
    // Guard against SSR where localStorage doesn't exist
    if (typeof window === 'undefined' || !localStorage) return;
    
    // First check localStorage for selectedVideos
    const selectedVideos = JSON.parse(localStorage.getItem('selectedVideos') || '{}');
    
    if (Object.keys(selectedVideos).length > 0) {
      // Convert the videos object to an array format for the queue
      const videoQueue = Object.entries(selectedVideos).map(([path, metadata]) => ({
        path,
        ...metadata
      }));
      setQueue(videoQueue);
      // Store in sessionStorage for persistence
      sessionStorage.setItem('gcw.queue', JSON.stringify(videoQueue));
    } else {
      // Fall back to sessionStorage if exists
      const storedQueue = JSON.parse(sessionStorage.getItem('gcw.queue') || '[]');
      if (storedQueue.length) {
        setQueue(storedQueue);
      }
    }

    // Load saved index
    const savedIndex = parseInt(sessionStorage.getItem('player.currentIndex') || '0');
    if (!isNaN(savedIndex)) {
      setCurrentIndex(savedIndex);
    }
  }, []);

  // Persist the current queue and index to sessionStorage
  useEffect(() => {
    // Guard against SSR where sessionStorage doesn't exist
    if (typeof window === 'undefined' || !sessionStorage) return;
    
    if (queue.length) {
      sessionStorage.setItem('gcw.queue', JSON.stringify(queue));
    }
    sessionStorage.setItem('player.currentIndex', String(currentIndex));
  }, [queue, currentIndex]);

  // Validate and ensure the current index is within bounds
  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= queue.length) {
      setCurrentIndex(0);
    }
  }, [queue, currentIndex]);

  const currentItem = queue.length ? queue[currentIndex] : null;
  const videoUrl = useMemo(() => (currentItem ? buildVideoUrl(currentItem.path) : ''), [currentItem]);

  // Handle video selection from queue
  const handleSelectVideo = (idx) => {
    setCurrentIndex(idx);
    // Guard against SSR where document doesn't exist
    if (typeof document !== 'undefined') {
      const el = document.querySelector(`[data-q-idx="${idx}"]`);
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  };

  // Navigation functions
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (queue.length > 0) {
      // Wrap to last video
      setCurrentIndex(queue.length - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (queue.length > 0) {
      // Wrap to first video
      setCurrentIndex(0);
    }
  };

  const handleSeekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seekTime);
    }
  };

  const handleSeekForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration || 0,
        videoRef.current.currentTime + seekTime
      );
    }
  };

  // Handle video end based on playback mode
  const handleVideoEnd = () => {
    if (playbackMode === 'continuous' && currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    else if (playbackMode === 'repeat') {
      videoRef.current.currentTime = 0;
      videoRef.current.play(); // Restart and play the video
    }
    else if (playbackMode === 'single') {
      videoRef.current.pause(); // Just pause
    }

  };

  // Queue resizing
  const handleDividerMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
  };

  useEffect(() => {
    // Guard against SSR where window/document don't exist
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const handleMouseMove = (e) => {
      if (isDraggingRef.current) {
        const newWidth = window.innerWidth - e.clientX;
        setQueueWidth(Math.max(200, Math.min(600, newWidth)));
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    if (isDraggingRef.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Handle mobile queue dragging
  const handleQueueTouchStart = (e) => {
    if (!isMobile) return;
    isDraggingQueueRef.current = true;
    dragStartYRef.current = e.touches[0].clientY;
    startOffsetRef.current = queueHeight;
  };

  const handleQueueTouchMove = (e) => {
    if (!isDraggingQueueRef.current || !isMobile) return;
    const deltaY = dragStartYRef.current - e.touches[0].clientY;
    // Calculate new height based on drag (min 100px, max 60vh)
    const maxHeight = window.innerHeight * 0.6;
    const newHeight = Math.max(100, Math.min(maxHeight, startOffsetRef.current + deltaY));
    setQueueHeight(newHeight);
  };

  const handleQueueTouchEnd = () => {
    isDraggingQueueRef.current = false;
  };

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Override video fullscreen to use container instead
  useEffect(() => {
    const video = videoRef.current;
    const container = videoContainerRef.current;
    if (!video || !container) return;

    const handleDblClick = (e) => {
      e.preventDefault();
      if (!document.fullscreenElement) {
        container.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };

    video.addEventListener('dblclick', handleDblClick);
    
    // Intercept fullscreen request from video controls
    const originalRequestFullscreen = video.requestFullscreen;
    video.requestFullscreen = function() {
      if (container.requestFullscreen) {
        return container.requestFullscreen();
      }
      return originalRequestFullscreen.call(this);
    };

    return () => {
      video.removeEventListener('dblclick', handleDblClick);
      video.requestFullscreen = originalRequestFullscreen;
    };
  }, [currentItem]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleSeekBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeekForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
          break;
        case 'q':
          setIsQueueCollapsed(!isQueueCollapsed);
          break;
      }
    };

    // Guard against SSR where window doesn't exist
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown);
      return () => window.removeEventListener('keydown', handleKeydown);
    }
  }, [currentIndex, queue.length, isQueueCollapsed, seekTime]);

  return (
    <div className="player-container">
      {/* Main video area */}
      <div 
        className={`player-main ${isMobile && isQueueCollapsed ? 'mobile-expanded' : ''}`} 
        style={{ 
          marginRight: !isMobile && !isQueueCollapsed ? queueWidth + 'px' : 0,
          height: isMobile && !isQueueCollapsed ? `calc(100vh - 40vh - ${queueHeight}px)` : 'auto'
        }}
      >
        {currentItem ? (
          <>
            <div ref={videoContainerRef} className={`video-container ${isFullscreen ? 'fullscreen' : ''}`}>
              <video
                ref={videoRef}
                key={currentItem.path}
                src={videoUrl}
                controls
                autoPlay
                className="player-video"
                playsInline
                webkit-playsinline
                onEnded={handleVideoEnd}
                onError={(e) => {
                  console.error('Video failed to load:', e?.currentTarget?.src);
                }}
              />
              {isFullscreen && (
                <div className="fullscreen-nav-overlay">
                  <button 
                    className="fullscreen-nav-btn prev"
                    onClick={handlePrevious}
                    aria-label="Previous video"
                  >
                    ← Previous
                  </button>
                  <button 
                    className="fullscreen-nav-btn next"
                    onClick={handleNext}
                    aria-label="Next video"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>

            {/* Player controls */}
            <div className="player-controls">
              <button className="control-button" onClick={handlePrevious}>
                Previous
              </button>
              <button className="control-button" onClick={handleSeekBackward}>
                ← {seekTime}s
              </button>
              <button className="control-button" onClick={handleSeekForward}>
                {seekTime}s →
              </button>
              <button className="control-button" onClick={handleNext}>
                Next
              </button>
              
              <div className="seek-selector">
                <label>Seek:</label>
                <select value={seekTime} onChange={(e) => setSeekTime(Number(e.target.value))}>
                  <option value={1}>1s</option>
                  <option value={2}>2s</option>
                  <option value={3}>3s</option>
                  <option value={4}>4s</option>
                  <option value={5}>5s</option>
                  <option value={6}>6s</option>
                  <option value={7}>7s</option>
                  <option value={8}>8s</option>
                  <option value={9}>9s</option>
                  <option value={10}>10s</option>
                </select>
              </div>
            </div>

            {/* Info section */}
            <div className={`info-section ${isMobile ? 'mobile' : ''} ${isMobile && isQueueCollapsed ? 'expanded' : ''}`}>
              <div className="player-details">
                <h3>Video {currentIndex + 1} of {queue.length}</h3>
                <div className="details-wrapper">
                  <div className="video-details">
                    <div><strong>Date:</strong> {formatDateTime(currentItem.time)}</div>
                    <div><strong>Site:</strong> {currentItem.site || 'N/A'}</div>
                    <div><strong>Elevation:</strong> {`${currentItem.elevation} ft` || 'N/A'}</div>
                    <div><strong>Animals:</strong> {currentItem.animals?.length > 0 ? currentItem.animals.join(', ') : 'none'}</div>
                    <div><strong>Actions:</strong> {currentItem.actions?.length > 0 ? currentItem.actions.join(', ') : 'none'}</div>
                    <div><strong>Additional Labels:</strong> {currentItem.additional_labels?.length > 0 ? currentItem.additional_labels.join(', ') : 'none'}</div>
                  </div>
                  <div className="description-section">
                    <div><strong>Description:</strong> {currentItem.AI_description || 'none'}</div>
                  </div>
                </div>
                <div className="keyboard-shortcuts">
                  <b>Keyboard Shortcuts:</b>
                  Space: Play/Pause | ←/→: Seek | ↑/↓: Prev/Next | Q: Toggle Queue
                </div>
              </div>

              {/* Playback options */}
              <div className="playback-options">
                <h4>Playback Options</h4>
                <div className="option-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="playbackMode"
                      value="single"
                      checked={playbackMode === 'single'}
                      onChange={(e) => setPlaybackMode(e.target.value)}
                    />
                    <span>Play Once</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="playbackMode"
                      value="continuous"
                      checked={playbackMode === 'continuous'}
                      onChange={(e) => setPlaybackMode(e.target.value)}
                    />
                    <span>Play All</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="playbackMode"
                      value="repeat"
                      checked={playbackMode === 'repeat'}
                      onChange={(e) => setPlaybackMode(e.target.value)}
                    />
                    <span>Repeat Video</span>
                  </label>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-video-message">
            <h2>No videos in queue</h2>
            <p>Select videos from the main page to play them here.</p>
          </div>
        )}
      </div>

      {/* Queue sidebar - desktop always renders, mobile only when not collapsed */}
      {(isMobile ? !isQueueCollapsed : true) && (
        <>
          {!isMobile && !isQueueCollapsed && (
            <div 
              className="queue-divider"
              style={{ right: queueWidth + 'px' }}
              onMouseDown={handleDividerMouseDown}
            />
          )}
          <div 
            ref={queueRef}
            className={`queue-sidebar ${isMobile ? 'mobile-draggable' : ''} ${!isMobile && isQueueCollapsed ? 'collapsed' : ''}`} 
            style={{ 
              width: isMobile ? '100%' : isQueueCollapsed ? '0' : queueWidth + 'px',
              height: !isMobile ? 'auto' : isQueueCollapsed ? '0' : `${queueHeight}px`
            }}
          >

            <h2 className="queue-title">
              <span>Queue ({queue.length})</span>
              {isMobile && (
                <div 
                  className="queue-drag-handle"
                  onTouchStart={handleQueueTouchStart}
                  onTouchMove={handleQueueTouchMove}
                  onTouchEnd={handleQueueTouchEnd}
                >
                  <div className="drag-indicator"></div>
                </div>
              )}
              {isMobile && (
                
                <button 
                  className="queue-collapse-btn"
                  onClick={() => setIsQueueCollapsed(!isQueueCollapsed)}
                >
                  ▼
                </button>
              )}
            </h2>
            {(!isMobile || !isQueueCollapsed) && (
              <div className="queue-list">
              {queue.map((item, idx) => (
                <div
                  key={item.path}
                  data-q-idx={idx}
                  className={`queue-item ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => handleSelectVideo(idx)}
                >
                  <div className="queue-thumbnail">
                    <video 
                      src={buildVideoUrl(item.path)}
                      muted
                      preload="metadata"
                      onError={() => console.log(`Thumbnail failed for: ${item.path}`)}
                    />
                    <div className="queue-number">{idx + 1}</div>
                  </div>
                  <div className="queue-info">
                    <div className="queue-meta">{item.site || 'Unknown Site'}</div>
                    {item.animals?.length > 0 && (
                      <div className="queue-meta">{item.animals.join(', ')}</div>
                    )}
                    <div className="queue-meta">{formatDate(item.time)}</div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Queue toggle button */}
      {(!isMobile && (
        <button
          className="queue-toggle"
          style={{ right: isQueueCollapsed ? 0 : queueWidth + 'px' }}
          onClick={() => setIsQueueCollapsed(!isQueueCollapsed)}
        >
          {isQueueCollapsed ? '◀' : '▶'}
        </button>
      ))}
      
      {/* Mobile queue reopen button when collapsed */}
      {isMobile && isQueueCollapsed && (
        <button
          className="mobile-queue-reopen"
          onClick={() => setIsQueueCollapsed(false)}
          aria-label="Open queue"
        >
          <div className="reopen-arrow">↑</div>
          <div className="reopen-text">Queue ({queue.length})</div>
        </button>
      )}
    </div>
  );
}