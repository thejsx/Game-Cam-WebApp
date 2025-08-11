import { create, get} from "zustand";
import { fetchLabels} from "./src/api";


const useGlobalStore = create((set) => ({
    selectedSettings: {
        sites: [],
        animals: [],
        actions: [],
        add_labels: [],
        start: null,
        end: null,
        restricted: true
    },
    videos: [],
    reverseSettings: {},

    setSelectedSettings: (settings) => set((state) => ({
        selectedSettings: { ...state.selectedSettings, ...settings }
    })),
    
    updateFunction: () => {
        const { selectedSettings } = get();
        fetchLabels(selectedSettings).then(data => {
            set({ videos: data.videos_labels, reverseSettings: data.reverse_subset });
        });
    }
    
}));

export default useGlobalStore;
