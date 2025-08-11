// frontend/src/components/Player.jsx
import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import "../styles/Player.css";
import useGlobalStore from "../../GlobalStore";

export default function Player() {
  console.log("Player component initialized");
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [labels, setLabels] = useState(null);
  const [seekDuration, setSeekDuration] = useState(10); // Default 10 seconds
  const videoRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem("selectedVideos");
    const map = JSON.parse(raw);
    setQueue(Object.keys(map));
    setCurrent(Object.keys(map)[0]);
    setLabels(map);
    console.log("Queue initialized:", map);
    console.log("Current video set to:", current);
    console.log("Labels set to:", labels);
    console.log("Queue length:", queue.length);
  }, []);

  // Skip to next video
  const skipNext = () => {
    const currentIndex = queue.indexOf(current);
    if (currentIndex < queue.length - 1) {
      setCurrent(queue[currentIndex + 1]);
    } else if (queue.length > 0) {
      setCurrent(queue[0]); // Cycle back to first
    }
  };

  // Skip to previous video
  const skipPrevious = () => {
    const currentIndex = queue.indexOf(current);
    if (currentIndex > 0) {
      setCurrent(queue[currentIndex - 1]);
    } else if (queue.length > 0) {
      setCurrent(queue[queue.length - 1]); // Cycle to last
    }
  };

  // Seek forward/backward
  const seekForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + seekDuration,
        videoRef.current.duration
      );
    }
  };

  const seekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - seekDuration,
        0
      );
    }
  };

  // Auto-play next video when current ends
  const handleVideoEnd = () => {
    skipNext();
  };

  // Auto-play when video changes
  useEffect(() => {
    if (videoRef.current && current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log('Auto-play prevented:', e));
    }
  }, [current]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return; // Don't interfere with input fields
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          seekBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          skipPrevious();
          break;
        case 'ArrowDown':
          e.preventDefault();
          skipNext();
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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [seekDuration]);

  if (!current) return <div className="no-video-message">No video selected.</div>;

  const info = labels[current];

  // Build detailed description
  const getDetailedDescription = () => {
    if (!info) return 'Loading...';
    
    const date = new Date(info.time).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return (
      <div className="video-details">
        <div><b>Date/Time:</b> {date}</div>
        <div><b>Site:</b> {info.site}</div>
        <div><b>Animals:</b> {info.animals.length ? info.animals.join(', ') : 'None'}</div>
        <div><b>Actions:</b> {info.actions.length ? info.actions.join(', ') : 'None'}</div>
        <div><b>Additional Labels:</b> {info.additional_labels.length ? info.additional_labels.join(', ') : 'None'}</div>
        <div><b>File:</b> {current.split('\\').pop()}</div>
      </div>
    );
  };

  const seekDurations = [1,2,3,4,5,6,7,8,9,10];

  return (
    <div className="player-container">
      {/* Main video area */}
      <div className="player-main">
        {/* Video player */}
        <video 
          ref={videoRef}
          className="player-video" 
          controls
          autoPlay
          onEnded={handleVideoEnd}
          src={`${API}/api/video?path=${encodeURIComponent(current)}`} 
        />
        
        {/* Control buttons */}
        <div className="player-controls">
          <button 
            onClick={skipPrevious} 
            className="control-button"
            title="Previous video (↑)"
          >
            ⬅ Previous
          </button>
          
          <button 
            onClick={seekBackward} 
            className="control-button"
            title={`Seek backward ${seekDuration}s (←)`}
          >
            ⏪ -{seekDuration}s
          </button>
          
          <button 
            onClick={seekForward} 
            className="control-button"
            title={`Seek forward ${seekDuration}s (→)`}
          >
            ⏩ +{seekDuration}s
          </button>
          
          <button 
            onClick={skipNext} 
            className="control-button"
            title="Next video (↓)"
          >
            Next ➡
          </button>
          
          <div className="seek-selector">
            <label>Seek:</label>
            <select 
              value={seekDuration} 
              onChange={(e) => setSeekDuration(parseInt(e.target.value))}
            >
              {seekDurations.map(duration => (
                <option key={duration} value={duration}>{duration}s</option>
              ))}
            </select>
          </div>
        </div>

        {/* Video details */}
        <div className="player-details">
          <h3>Video Details</h3>
          {getDetailedDescription()}
          <div className="keyboard-shortcuts">
            <b>Keyboard shortcuts:</b>
            <div>← → : Seek backward/forward ({seekDuration}s) | ↑ ↓ : Previous/Next video | Space: Play/Pause</div>
          </div>
        </div>
      </div>

      {/* YouTube-style right sidebar queue */}
      <div className="queue-sidebar">
        <h3 className="queue-title">Queue ({queue.length} videos)</h3>
        
        {queue.map((v, index) => {
          const videoInfo = labels && labels.video_labels && labels.video_labels[v];
          const isActive = v === current;
          
          return (
            <div 
              key={v} 
              onClick={() => setCurrent(v)} 
              className={`queue-item ${isActive ? 'active' : ''}`}
            >
              {/* Thumbnail */}
              <div className="queue-thumbnail">
                <video 
                  src={`${API}/api/video?path=${encodeURIComponent(v)}`}
                  muted
                />
              </div>
              
              {/* Video info */}
              <div className="queue-info">
                <div className={`queue-title-text ${isActive ? 'active' : ''}`}>
                  {index + 1}. {videoInfo ? videoInfo.time.split('T')[0] : 'Loading...'}
                </div>
                {videoInfo && (
                  <>
                    <div className="queue-meta">
                      <b>Site:</b> {videoInfo.site}
                    </div>
                    <div className="queue-meta">
                      <b>Animals:</b> {videoInfo.animals.join(', ') || 'None'}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}