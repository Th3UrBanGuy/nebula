
import { create } from 'zustand';
import { AppState, MOCK_CHANNELS, generateMockPrograms, ViewState, User, CHARACTER_AVATARS, COVER_SCENES, License } from './types';
import { fetchChannelsFromDB, addChannelsToDB, deleteChannelFromDB, loginUserFromDB, registerUserInDB, getUserById, updateUserInDB, initializeSchema } from './services/database';

// Updated MOCK_CHANNELS with REAL WORKING PUBLIC STREAMS for demonstration
const WORKING_CHANNELS = [
  { 
    id: 'nasa', 
    number: '101', 
    name: 'NASA TV', 
    provider: 'Government', 
    category: 'Science', 
    color: 'bg-gradient-to-br from-blue-600 to-indigo-600', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1200px-NASA_logo.svg.png', 
    description: 'Live coverage of missions and space exploration.',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-TV-Public/master.m3u8'
  },
  { 
    id: 'redbull', 
    number: '102', 
    name: 'Red Bull TV', 
    provider: 'Red Bull', 
    category: 'Sports', 
    color: 'bg-gradient-to-br from-red-700 to-yellow-500', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/1200px-Red_Bull_TV_logo.svg.png', 
    description: 'Extreme sports, music, and lifestyle entertainment.',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
  },
  { 
    id: 'aljazeera', 
    number: '103', 
    name: 'Al Jazeera', 
    provider: 'News Network', 
    category: 'News', 
    color: 'bg-gradient-to-br from-orange-500 to-amber-600', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_eng.svg/1200px-Aljazeera_eng.svg.png', 
    description: 'Breaking news and in-depth analysis from around the world.',
    streamUrl: 'https://live-hls-web-aje.getaj.net/AJE/03.m3u8'
  },
  { 
    id: 'dw', 
    number: '104', 
    name: 'DW English', 
    provider: 'Deutsche Welle', 
    category: 'News', 
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Deutsche_Welle_Logo_2012.svg/1200px-Deutsche_Welle_Logo_2012.svg.png', 
    description: 'Germany’s international broadcaster.',
    streamUrl: 'https://dwammseu-lh.akamaihd.net/i/dwstream555_live@127380/index_720_av-p.m3u8'
  },
  { 
    id: 'rakuten', 
    number: '105', 
    name: 'Rakuten Action', 
    provider: 'Rakuten', 
    category: 'Movies', 
    color: 'bg-gradient-to-br from-purple-600 to-pink-600', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Rakuten_TV_logo.svg/2560px-Rakuten_TV_logo.svg.png', 
    description: 'Non-stop action movies and thrillers.',
    streamUrl: 'https://rakuten-actionmovies-1-eu.rakuten.wurl.tv/playlist.m3u8'
  },
   { 
    id: 'ted', 
    number: '106', 
    name: 'TED', 
    provider: 'TED Talks', 
    category: 'Education', 
    color: 'bg-gradient-to-br from-red-600 to-red-500', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/TED_three_letter_logo.svg/1200px-TED_three_letter_logo.svg.png', 
    description: 'Ideas worth spreading.',
    streamUrl: 'https://ted-events-1-eu.rakuten.wurl.tv/playlist.m3u8'
  }
];

export const useStore = create<AppState>((set, get) => ({
  user: null, // Start unauthenticated
  view: 'home',
  activeChannelId: 'nasa',
  isPlaying: true,
  volume: 80,
  channels: [],
  programs: [],
  isLoading: true,
  isDbConfigured: false,

  setView: (view: ViewState) => set({ view }),
  
  setChannel: (channelId: string) => {
    set({ activeChannelId: channelId, isPlaying: true });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  removeChannel: async (id: string) => {
    set((state) => ({
      channels: state.channels.filter(c => c.id !== id)
    }));
    await deleteChannelFromDB(id);
  },

  importChannels: async (newChannels) => {
    set((state) => ({
      channels: [...state.channels, ...newChannels],
      programs: generateMockPrograms([...state.channels, ...newChannels])
    }));
    await addChannelsToDB(newChannels);
  },

  // Auth Actions
  login: async (email, pass, role) => {
    set({ isLoading: true });
    
    // Attempt Login First
    let user = await loginUserFromDB(email, pass);

    // If no user found, and role is provided, treat as Registration
    if (!user && role) {
        const isAdmin = role === 'admin';
        const randomAvatar = CHARACTER_AVATARS[Math.floor(Math.random() * CHARACTER_AVATARS.length)];
        const randomCover = COVER_SCENES[Math.floor(Math.random() * COVER_SCENES.length)];
        
        const newUser: User = {
            id: 'usr_' + Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email: email,
            role: role,
            avatar: isAdmin ? 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff' : randomAvatar,
            coverImage: randomCover,
            bio: 'New explorer of the Nebula.',
            preferences: { notifications: true, autoplay: true },
            license: isAdmin ? { status: 'active', key: 'ADMIN-OVERRIDE', expiryDate: 9999999999999, planName: 'System Administrator' } : undefined
        };

        const success = await registerUserInDB(newUser, pass);
        if (success) {
            user = newUser;
        }
    }

    set({ isLoading: false });

    if (user) {
        // Persist Session
        localStorage.setItem('nebula_session', user.id);
        set({ user });
        return true;
    }

    return false;
  },

  logout: () => {
    localStorage.removeItem('nebula_session');
    set({ user: null, view: 'home' });
  },

  updateProfile: async (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    set({ user: updatedUser });
    
    await updateUserInDB(updatedUser);
  },

  redeemLicense: async (key: string) => {
    const currentUser = get().user;
    if (!currentUser) return false;

    // Simulate License Validation Logic
    // In production, verify against a backend service/DB
    let plan = '';
    let duration = 0;

    if (key === 'LIVE-FREE-2025' || key.startsWith('NEBULA-')) {
        plan = 'Nebula Access Pass';
        duration = 1000 * 60 * 60 * 24 * 365; // 1 Year
    } else {
        return false; // Invalid Key
    }

    const newLicense: License = {
        key: key,
        status: 'active',
        expiryDate: Date.now() + duration,
        planName: plan
    };

    const updatedUser = { ...currentUser, license: newLicense };
    set({ user: updatedUser });
    await updateUserInDB(updatedUser);
    return true;
  },

  initialize: async () => {
    // 0. Initialize DB Schema
    const dbReady = await initializeSchema();
    set({ isDbConfigured: dbReady });

    // 1. Restore Session
    const sessionId = localStorage.getItem('nebula_session');
    if (sessionId && dbReady) {
        const user = await getUserById(sessionId);
        if (user) {
            // Check expiry on load
            if (user.license && user.license.expiryDate < Date.now()) {
                user.license.status = 'expired';
            }
            set({ user });
        } else {
            localStorage.removeItem('nebula_session');
        }
    }

    // 2. Fetch Content
    let channels = null;
    if (dbReady) {
        channels = await fetchChannelsFromDB();
    }

    if (!channels || channels.length === 0) {
      console.log("System: DB empty or unreachable. Loading Emergency Protocol (Working Streams).");
      channels = WORKING_CHANNELS;
    } else {
      console.log("System: Connected to Neural Network (Live DB).");
    }

    setTimeout(() => {
      set({
        channels: channels || [],
        programs: generateMockPrograms(channels || []),
        isLoading: false
      });
    }, 1000);
  }
}));
