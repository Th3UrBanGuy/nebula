import { create } from 'zustand';
import { AppState, MOCK_CHANNELS, generateMockPrograms, ViewState } from './types';
import { fetchChannelsFromDB } from './services/database';

export const useStore = create<AppState>((set, get) => ({
  view: 'home',
  activeChannelId: 'a1',
  isPlaying: true,
  volume: 80,
  channels: [],
  programs: [],
  isLoading: true,

  setView: (view: ViewState) => set({ view }),
  
  setChannel: (channelId: string) => {
    set({ activeChannelId: channelId, isPlaying: true });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  initialize: async () => {
    // Attempt to fetch from real DB first
    let channels = await fetchChannelsFromDB();

    // Fallback to MOCK_CHANNELS if DB fails or is empty
    if (!channels) {
      console.log("Using Mock Data");
      channels = MOCK_CHANNELS;
    } else {
      console.log("Using Live Database Data");
    }

    // Simulate network delay for effect
    setTimeout(() => {
      set({
        channels: channels || [],
        programs: generateMockPrograms(channels || []),
        isLoading: false
      });
    }, 1500);
  }
}));