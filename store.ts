
import { create } from 'zustand';
import { AppState, generateMockPrograms, ViewState, User, License, Channel } from './types';
import { CHARACTER_AVATARS, COVER_SCENES, DEFAULT_CHANNELS } from './constants';
import { fetchChannelsFromDB, addChannelsToDB, deleteChannelFromDB, loginUserFromDB, registerUserInDB, getUserById, updateUserInDB, initializeSchema, createLicenseInDB, fetchAllLicenses, redeemLicenseKey, getSetting, saveSetting } from './services/database';

export const useStore = create<AppState>((set, get) => ({
  user: null, // Start unauthenticated
  view: 'home',
  activeChannelId: null, // Initially no channel selected
  isPlaying: false,
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
      channels: state.channels.filter(c => c.id !== id),
      // If we remove the active channel, stop playing
      activeChannelId: state.activeChannelId === id ? null : state.activeChannelId,
      isPlaying: state.activeChannelId === id ? false : state.isPlaying
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
    set({ user: null, view: 'home', activeChannelId: null, isPlaying: false });
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
      dbChannels = DEFAULT_CHANNELS;
      await addChannelsToDB(DEFAULT_CHANNELS);
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
