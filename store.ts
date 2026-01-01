import { create } from 'zustand';
import { AppState, MOCK_CHANNELS, generateMockPrograms, ViewState, User, CHARACTER_AVATARS, COVER_SCENES } from './types';
import { fetchChannelsFromDB } from './services/database';

export const useStore = create<AppState>((set, get) => ({
  user: null, // Start unauthenticated
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

  removeChannel: (id: string) => {
    set((state) => ({
      channels: state.channels.filter(c => c.id !== id)
    }));
  },

  importChannels: (newChannels) => {
    set((state) => ({
      channels: newChannels,
      programs: generateMockPrograms(newChannels) // Regenerate programs for new channels
    }));
  },

  // Auth Actions
  login: async (email, pass, role) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Role Logic: 
    // 1. If role is explicitly provided (Registration), use it.
    // 2. If not (Login), infer from email or default to 'viewer'.
    let finalRole = role;
    if (!finalRole) {
         finalRole = email.toLowerCase().includes('admin') ? 'admin' : 'viewer';
    }

    const isAdmin = finalRole === 'admin';

    // Pick random assets for new user
    const randomAvatar = CHARACTER_AVATARS[Math.floor(Math.random() * CHARACTER_AVATARS.length)];
    const randomCover = COVER_SCENES[Math.floor(Math.random() * COVER_SCENES.length)];

    const mockUser: User = {
      id: isAdmin ? 'adm_' + Math.floor(Math.random() * 1000) : 'usr_' + Math.floor(Math.random() * 10000),
      name: isAdmin ? 'System Commander' : 'Neo Anderson',
      email: email,
      avatar: isAdmin 
        ? 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff' 
        : randomAvatar,
      coverImage: randomCover,
      role: finalRole as 'admin' | 'viewer',
      bio: isAdmin ? 'Authorized System Administrator. Level 5 Clearance.' : 'Digital nomad exploring the frequencies.',
      preferences: {
        notifications: true,
        autoplay: true
      }
    };
    
    set({ user: mockUser });
    return true;
  },

  logout: () => {
    set({ user: null, view: 'home' });
  },

  updateProfile: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }));
  },

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

    // Simulate network delay for boot effect
    setTimeout(() => {
      set({
        channels: channels || [],
        programs: generateMockPrograms(channels || []),
        isLoading: false
      });
    }, 1500);
  }
}));