import { create} from "zustand";
import { resortAllData, reverseSubset } from "./src/filterHelpers";

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const useGlobalStore = create((set, get) => ({
    selectedSettings: {},
    videos: {},
    reverseSettings: {},
    allVideoLabels: {}, // Store ALL video metadata
    isFiltering: false, // Add loading state
    
    setSelectedSettings: (settings) => set((state) => ({
        selectedSettings: { ...state.selectedSettings, ...settings }
    })),

    setVideos: (videos) => set({ videos }),
    setReverseSettings: (reverseSettings) => set({ reverseSettings }),
    setAllVideoLabels: (allVideoLabels) => set({ allVideoLabels }),
    setIsFiltering: (isFiltering) => set({ isFiltering }),
    
    // Immediate update function (non-debounced)
    updateFunctionImmediate: () => {
        const { selectedSettings, allVideoLabels } = get();
        
        set({ isFiltering: true });
        
        // Use requestAnimationFrame for smoother UI
        requestAnimationFrame(() => {
            // Client-side filtering
            const filteredVideos = resortAllData(
                allVideoLabels,
                selectedSettings.sites || [],
                selectedSettings.animals || [],
                selectedSettings.actions || [],
                selectedSettings.add_labels || [],
                [selectedSettings.start || "1900-01-01", selectedSettings.end || "2100-01-01"],
                selectedSettings.restricted || false
            );
            
            // Create filtered video object
            const videoObj = {};
            filteredVideos.forEach(vid => {
                videoObj[vid] = allVideoLabels[vid];
            });
            
            // Get reverse subset for graying out
            const reverseSubset_ = reverseSubset(filteredVideos, allVideoLabels);
            
            set({ 
                videos: videoObj,
                reverseSettings: reverseSubset_,
                isFiltering: false
            });
        });
    },
    
    // Debounced update function (150ms delay for better responsiveness)
    updateFunction: debounce(() => {
        get().updateFunctionImmediate();
    }, 150)
}));

export default useGlobalStore;