import { create } from 'zustand';
import { AppState, MOCK_CHANNELS, generateMockPrograms, ViewState, User, CHARACTER_AVATARS, COVER_SCENES } from './types';
import { fetchChannelsFromDB, addChannelsToDB, deleteChannelFromDB, loginUserFromDB, registerUserInDB, getUserById, updateUserInDB, initializeSchema } from './services/database';

export const useStore = create<AppState>((set, get) => ({
  user: null, // Start unauthenticated
  view: 'home',
  activeChannelId: 'a1',
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
    // Optimistic UI update
    set((state) => ({
      channels: state.channels.filter(c => c.id !== id)
    }));
    // DB Update
    await deleteChannelFromDB(id);
  },

  importChannels: async (newChannels) => {
    // 1. Update Local State
    set((state) => ({
      channels: [...state.channels, ...newChannels],
      programs: generateMockPrograms([...state.channels, ...newChannels])
    }));
    // 2. Persist to DB
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
            preferences: { notifications: true, autoplay: true }
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
    
    // DB Update
    await updateUserInDB(updatedUser);
  },

  initialize: async () => {
    // 0. Initialize DB Schema (Create Tables if missing)
    const dbReady = await initializeSchema();
    set({ isDbConfigured: dbReady });

    // 1. Restore Session
    const sessionId = localStorage.getItem('nebula_session');
    if (sessionId && dbReady) {
        const user = await getUserById(sessionId);
        if (user) {
            set({ user });
        } else {
            localStorage.removeItem('nebula_session'); // Invalid session
        }
    }

    // 2. Fetch Content
    let channels = null;
    if (dbReady) {
        channels = await fetchChannelsFromDB();
    }

    // Fallback to MOCK_CHANNELS if DB fails or is empty (for demo purposes if DB not set up)
    if (!channels || channels.length === 0) {
      console.log("System: DB empty or unreachable. Loading Emergency Protocol (Mock Data).");
      channels = MOCK_CHANNELS;
    } else {
      console.log("System: Connected to Neural Network (Live DB).");
    }

    // Simulate boot delay for effect
    setTimeout(() => {
      set({
        channels: channels || [],
        programs: generateMockPrograms(channels || []),
        isLoading: false
      });
    }, 1000);
  }
}));