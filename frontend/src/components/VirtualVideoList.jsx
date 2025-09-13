import { memo, useCallback } from 'react';

const VirtualVideoList = memo(({ videos, checkedVideos, setCheckedVideos, onOpenPlayer, height }) => {
    const videoEntries = Object.entries(videos);
    const totalItems = videoEntries.length;
    
    const handleToggle = useCallback((vid) => {
        setCheckedVideos(prev => 
            prev.includes(vid) 
                ? prev.filter(v => v !== vid)
                : [...prev, vid]
        );
    }, [setCheckedVideos]);
    
    if (totalItems === 0) {
        return <p>No videos available</p>;
    }
    
    // Simple traditional scrolling list - no virtualization
    return (
        <div style={{
            height: height ? `${height}px` : '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            width: 'max-content',
            minWidth: '100%'
        }}>
            {videoEntries.map(([vid, info], index) => {
                const date = info ? info.time.split('T')[0] : '';
                const site = info?.site || '';
                const displayName = `${index + 1}. ${date}  ${site}`;
                
                return (
                    <div key={vid} className="video-item">
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
});

export default VirtualVideoList;