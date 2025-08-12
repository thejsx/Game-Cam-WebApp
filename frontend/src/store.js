import { create } from 'zustand';
import { resortAllData, reverseSubset, sortVideoLabelsByDate } from './filterHelpers';

const useStore = create((set, get) => ({
    // Raw data
    videoLabels: {},
    allItems: null,
    
    // Filtered results
    filteredVideos: [],
    activeItems: null,
    
    // Initialize with fetched data
    setInitialData: (videoLabels, allItems) => {
        const sorted = sortVideoLabelsByDate(videoLabels);
        set({ 
            videoLabels: sorted,
            allItems 
        });
    },
    
    // Apply filters and update results
    applyFilters: (sites, animals, actions, addLabels, dateLabels, restricted) => {
        const { videoLabels } = get();
        
        // Forward filtering
        const filteredVideos = resortAllData(
            videoLabels,
            sites,
            animals,
            actions,
            addLabels,
            dateLabels,
            restricted
        );
        
        // Backward filtering to get active items
        const activeItems = reverseSubset(filteredVideos, videoLabels);
        
        set({ filteredVideos, activeItems });
        
        return { videos: filteredVideos, activeItems };
    }
}));

export default useStore;