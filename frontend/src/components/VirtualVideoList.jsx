import { memo, useRef, useState, useEffect, useCallback } from 'react';

const ITEM_HEIGHT = 24; // Height of each video item in pixels
const BUFFER_SIZE = 10; // Number of items to render outside visible area

const VirtualVideoList = memo(({ videos, checkedVideos, setCheckedVideos, onOpenPlayer, height }) => {
    const scrollContainerRef = useRef(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(height || 300);
    const [useFlexHeight, setUseFlexHeight] = useState(!height);
    
    const videoEntries = Object.entries(videos);
    const totalItems = videoEntries.length;
    const totalHeight = totalItems * ITEM_HEIGHT;
    
    // Calculate visible range
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
        totalItems,
        Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
    );
    
    const visibleItems = videoEntries.slice(startIndex, endIndex);
    const offsetY = startIndex * ITEM_HEIGHT;
    
    const handleScroll = useCallback((e) => {
        setScrollTop(e.target.scrollTop);
    }, []);
    
    // Initialize scroll position for proper rendering
    useEffect(() => {
        if (scrollContainerRef.current && totalItems > 0) {
            setScrollTop(scrollContainerRef.current.scrollTop || 0);
        }
    }, [totalItems]);
    
    const handleToggle = useCallback((vid) => {
        setCheckedVideos(prev => 
            prev.includes(vid) 
                ? prev.filter(v => v !== vid)
                : [...prev, vid]
        );
    }, [setCheckedVideos]);
    
    useEffect(() => {
        if (height) {
            setContainerHeight(height);
            setUseFlexHeight(false);
        } else {
            setUseFlexHeight(true);
        }
    }, [height]);
    
    if (totalItems === 0) {
        return <p>No videos available</p>;
    }
    
    // If less than 100 videos, don't use virtualization
    if (totalItems < 100) {
        return (
            <div style={{
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                {videoEntries.map(([vid, info], index) => {
                    const date = info ? info.time.split('T')[0] : '';
                    const site = info?.site || '';
                    const displayName = `${index + 1}. ${date}  ${site}`;
                    
                    return (
                        <div key={vid} className="video-item" style={{ height: 'auto' }}>
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={checkedVideos.includes(vid)}
                                    onChange={() => handleToggle(vid)}
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
        );
    }
    
    // Use virtualization for large lists
    return (
        <div 
            ref={scrollContainerRef}
            className="virtual-scroll-container"
            onScroll={handleScroll}
            style={useFlexHeight ? {
                height: '100%',
                overflowY: 'auto',
                position: 'relative',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column'
            } : { 
                height: `${containerHeight}px`, 
                overflowY: 'auto',
                position: 'relative'
            }}
        >
            <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map(([vid, info], i) => {
                        const index = startIndex + i;
                        const date = info ? info.time.split('T')[0] : '';
                        const site = info?.site || '';
                        const displayName = `${index + 1}. ${date} ${site}`;
                        
                        return (
                            <div 
                                key={vid} 
                                className="video-item"
                                style={{ height: `${ITEM_HEIGHT}px` }}
                            >
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={checkedVideos.includes(vid)}
                                        onChange={() => handleToggle(vid)}
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
});

export default VirtualVideoList;