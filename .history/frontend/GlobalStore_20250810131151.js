import { create} from "zustand";
import { fetchLabels} from "./src/api";


const useGlobalStore = create((set, get) => ({
    selectedSettings: {    },
    videos: {},
    reverseSettings: {},

    setSelectedSettings: (settings) => set((state) => ({
        selectedSettings: { ...state.selectedSettings, ...settings }
    })),

    setVideos: (videos) => set({ videos }),
    setReverseSettings: (reverseSettings) => set({ reverseSettings }),
    
    updateFunction: () => {
        const { selectedSettings } = get();
        fetchLabels(selectedSettings).then(data => {
            set({ 
                videos: data.videos_labels || [], 
                reverseSettings: data.reverse_subset || {
                    sites: [],
                    animals: [],
                    actions: [],
                    add_labels: []
                }
            });
        });
    }
    
}));

export default useGlobalStore;
