import { create} from "zustand";

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
    setVideos: (videos) => set({ videos }),
    setReverseSettings: (reverseSettings) => set({ reverseSettings }),
}));

export default useGlobalStore;
