import { create} from "zustand";
import { resortAllData, reverseSubset } from "./src/filterHelpers";

const useGlobalStore = create((set, get) => ({
    selectedSettings: {},
    videos: {},
    reverseSettings: {},
    allVideoLabels: {}, // Store ALL video metadata
    
    setSelectedSettings: (settings) => set((state) => ({
        selectedSettings: { ...state.selectedSettings, ...settings }
    })),

    setVideos: (videos) => set({ videos }),
    setReverseSettings: (reverseSettings) => set({ reverseSettings }),
    setAllVideoLabels: (allVideoLabels) => set({ allVideoLabels }),
    
    updateFunction: () => {
        const { selectedSettings, allVideoLabels } = get();
        
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
            reverseSettings: reverseSubset_
        });
    }
}));

export default useGlobalStore;
