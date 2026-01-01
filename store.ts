
import { create } from 'zustand';
import { AppState, generateMockPrograms, ViewState, User, CHARACTER_AVATARS, COVER_SCENES, License, Channel } from './types';
import { fetchChannelsFromDB, addChannelsToDB, deleteChannelFromDB, loginUserFromDB, registerUserInDB, getUserById, updateUserInDB, initializeSchema, createLicenseInDB, fetchAllLicenses, redeemLicenseKey, getSetting, saveSetting } from './services/database';

// Updated MOCK_CHANNELS with REAL WORKING PUBLIC STREAMS for demonstration
// Using reliable CDN test streams (Mux, Akamai) to ensure playback stability in prototype mode
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
    id: 'action_sports', 
    number: '102', 
    name: 'Action Sports', 
    provider: 'Red Bull', 
    category: 'Sports', 
    color: 'bg-gradient-to-br from-red-700 to-yellow-500', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/1200px-Red_Bull_TV_logo.svg.png', 
    description: 'Extreme sports, music, and lifestyle entertainment.',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' 
  },
  { 
    id: 'aljazeera', 
    number: '103', 
    name: 'News 24', 
    provider: 'Global News', 
    category: 'News', 
    color: 'bg-gradient-to-br from-orange-500 to-amber-600', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_eng.svg/1200px-Aljazeera_eng.svg.png', 
    description: 'Breaking news and in-depth analysis from around the world.',
    streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8'
  },
  { 
    id: 'cinema_one', 
    number: '104', 
    name: 'Cinema One', 
    provider: 'Nebula Movies', 
    category: 'Movies', 
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Deutsche_Welle_Logo_2012.svg/1200px-Deutsche_Welle_Logo_2012.svg.png', 
    description: 'Classic cinema and independent films.',
    streamUrl: 'https://test-streams.mux.dev/tos_isf/playlist.m3u8'
  },
  { 
    id: 'fantasy_tv', 
    number: '105', 
    name: 'Fantasy TV', 
    provider: 'Rakuten', 
    category: 'Entertainment', 
    color: 'bg-gradient-to-br from-purple-600 to-pink-600', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Rakuten_TV_logo.svg/2560px-Rakuten_TV_logo.svg.png', 
    description: 'Dragons, dungeons, and epic tales.',
    streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
  },
   { 
    id: 'tech_talk', 
    number: '106', 
    name: 'Tech Talk', 
    provider: 'TED Talks', 
    category: 'Education', 
    color: 'bg-gradient-to-br from-red-600 to-red-500', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/TED_three_letter_logo.svg/1200px-TED_three_letter_logo.svg.png', 
    description: 'Ideas worth spreading and future tech.',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
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
  adminLicenses: [],
  aynaUrl: "https://raw.githubusercontent.com/devmujahidul/Auto_Fetch/main/output.json",

  setView: (view: ViewState) => set({ view }),
  
  setChannel: (channelId: string) => {
    set({ activeChannelId: channelId, isPlaying: true });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  removeChannel: async (id: string) => {
    set((state) => ({
      channels: state.channels.filter(c => c.id !== id)
    }));
    // Only delete from DB if it's NOT an auto-synced channel
    if (!id.startsWith('ayna_')) {
        await deleteChannelFromDB(id);
    }
  },

  importChannels: async (newChannels) => {
    set((state) => ({
      channels: [...state.channels, ...newChannels],
      programs: generateMockPrograms([...state.channels, ...newChannels])
    }));
    await addChannelsToDB(newChannels);
  },

  // --- AYNA AUTO SCRIPT ACTIONS ---
  
  updateAynaUrl: async (url: string) => {
    set({ aynaUrl: url });
    await saveSetting('ayna_json_url', url);
  },

  syncAynaChannels: async () => {
    const url = get().aynaUrl;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch JSON");

        const data = await res.json();
        const externalChannels = data.channels || [];

        if (externalChannels.length === 0) throw new Error("No channels found in JSON");

        // Map without saving to DB (Transient State)
        const mappedChannels: Channel[] = externalChannels.map((c: any) => ({
            id: `ayna_${c.id || Math.random().toString(36).substr(2,9)}`,
            number: c.keyCode ? `A${c.keyCode}` : 'AUTO',
            name: c.title || "Unknown Channel",
            logo: c.image || c.logo || "https://placehold.co/400?text=NO+LOGO",
            provider: 'Ayna OTT',
            category: 'Ayna OTT', // New Group Requirement
            color: 'bg-indigo-900',
            description: `Auto-synced from Ayna OTT. Age Limit: ${c.ageLimit || 0}+`,
            streamUrl: c.url // Dynamic URL with token
        }));

        // Filter out existing Ayna channels from state to replace them
        const currentChannels = get().channels;
        const dbChannels = currentChannels.filter(c => !c.id.startsWith('ayna_'));
        
        const newSet = [...dbChannels, ...mappedChannels];

        set({ 
            channels: newSet,
            programs: generateMockPrograms(newSet) 
        });

        // NOTE: We do NOT call addChannelsToDB here. 
        // These are dynamic resources handled by the Auto Script.

        return { success: true, count: mappedChannels.length };
    } catch (e: any) {
        console.error("Ayna Sync Error:", e);
        return { success: false, count: 0, error: e.message };
    }
  },

  // --- Auth Actions ---
  login: async (email, pass) => {
    const user = await loginUserFromDB(email, pass);
    
    if (user) {
        localStorage.setItem('nebula_session', user.id);
        set({ user });
        return { success: true };
    }
    return { success: false, error: "Invalid credentials." };
  },

  register: async (email, pass, role) => {
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

      const result = await registerUserInDB(newUser, pass);
      
      if (result.success) {
          localStorage.setItem('nebula_session', newUser.id);
          set({ user: newUser });
          return { success: true };
      }
      
      return { success: false, error: result.error || "Registration failed." };
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

    const { valid, plan, days } = await redeemLicenseKey(key);

    if (valid && plan && days) {
        const durationMs = days * 24 * 60 * 60 * 1000;
        const newLicense: License = {
            key: key,
            status: 'active',
            expiryDate: Date.now() + durationMs,
            planName: plan
        };
        const updatedUser = { ...currentUser, license: newLicense };
        set({ user: updatedUser });
        await updateUserInDB(updatedUser);
        return true;
    }
    return false;
  },

  generateNewLicense: async (plan: string, days: number, customKey?: string) => {
    let key;
    if (customKey && customKey.trim().length > 0) {
        key = customKey.trim().toUpperCase();
    } else {
        const randomPart = Math.random().toString(36).substr(2, 8).toUpperCase();
        key = `NEBULA-${randomPart.slice(0,4)}-${randomPart.slice(4,8)}`;
    }
    const result = await createLicenseInDB(key, plan, days);
    if (result.success) {
        const licenses = await fetchAllLicenses();
        set({ adminLicenses: licenses });
    } else {
        console.error(result.message);
        throw new Error(result.message);
    }
  },

  fetchAdminLicenses: async () => {
      const licenses = await fetchAllLicenses();
      set({ adminLicenses: licenses });
  },

  initialize: async () => {
    // 0. Initialize DB Schema
    await initializeSchema();

    // 1. Restore Session
    const sessionId = localStorage.getItem('nebula_session');
    if (sessionId) {
        const user = await getUserById(sessionId);
        if (user) {
            if (user.license && user.license.expiryDate < Date.now()) {
                user.license.status = 'expired';
            }
            set({ user });
        } else {
            localStorage.removeItem('nebula_session');
        }
    }

    // 2. Fetch DB Content (Manual Channels)
    let dbChannels = await fetchChannelsFromDB();
    if (!dbChannels || dbChannels.length === 0) {
      console.log("System: Proto DB empty. Seeding default channels.");
      dbChannels = WORKING_CHANNELS;
      await addChannelsToDB(WORKING_CHANNELS);
    }

    // 3. Auto Fetch Ayna Content (Dynamic Channels)
    let aynaChannels: Channel[] = [];
    try {
        const savedUrl = await getSetting('ayna_json_url');
        const urlToUse = savedUrl || get().aynaUrl;
        if (savedUrl) set({ aynaUrl: savedUrl });

        console.log("AutoScript: Fetching Ayna Feed...", urlToUse);
        const res = await fetch(urlToUse);
        if (res.ok) {
            const data = await res.json();
            aynaChannels = (data.channels || []).map((c: any) => ({
                id: `ayna_${c.id}`,
                number: c.keyCode ? `A${c.keyCode}` : 'AUTO',
                name: c.title || "Unknown",
                logo: c.image || c.logo || "",
                provider: 'Ayna OTT',
                category: 'Ayna OTT',
                color: 'bg-indigo-900',
                description: `Dynamic Stream. Age: ${c.ageLimit || 0}+`,
                streamUrl: c.url
            }));
            console.log(`AutoScript: Loaded ${aynaChannels.length} dynamic channels.`);
        }
    } catch (e) {
        console.warn("AutoScript: Failed to load dynamic channels.", e);
    }

    // 4. Merge (DB + Dynamic)
    const allChannels = [...(dbChannels || []), ...aynaChannels];

    setTimeout(() => {
      set({
        channels: allChannels,
        programs: generateMockPrograms(allChannels),
        isLoading: false
      });
    }, 1000);
  }
}));
