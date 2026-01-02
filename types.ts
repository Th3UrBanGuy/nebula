
export type ViewState = 'home' | 'guide' | 'player' | 'ai' | 'settings' | 'profile' | 'admin';

export interface License {
    status: 'active' | 'expired' | 'none';
    key: string;
    expiryDate: number; // timestamp
    planName: string;
}

// Admin facing license key data
export interface LicenseKey {
    id: string;
    key: string;
    plan: string;
    durationDays: number;
    status: 'unused' | 'redeemed';
    createdAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  role: 'admin' | 'viewer';
  license?: License; // New field
  preferences: {
    notifications: boolean;
    autoplay: boolean;
  };
}

export interface Channel {
  id: string;
  number: string;
  name: string;
  logo: string;
  provider: string; // e.g., 'Akash Net', 'Global Sat', 'Local Stream'
  category: string;
  color: string; // CSS class for gradient/bg
  description: string;
  streamUrl?: string; // New field for M3U8 links
}

export interface Program {
  id: string;
  channelId: string;
  title: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  description: string;
  thumbnail: string;
}

export interface AppState {
  user: User | null;
  view: ViewState;
  activeChannelId: string | null;
  isPlaying: boolean;
  volume: number;
  channels: Channel[];
  programs: Program[];
  isLoading: boolean;
  adminLicenses: LicenseKey[]; // Cache for admin view
  
  // Ayna Auto Script Config
  aynaUrl: string;

  // Actions
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, role: 'admin' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  redeemLicense: (key: string) => Promise<boolean>;
  generateNewLicense: (plan: string, days: number, customKey?: string) => Promise<void>;
  fetchAdminLicenses: () => Promise<void>;
  
  // Ayna Actions
  updateAynaUrl: (url: string) => Promise<void>;
  syncAynaChannels: () => Promise<{ success: boolean; count: number; error?: string }>;

  setView: (view: ViewState) => void;
  setChannel: (channelId: string) => void;
  removeChannel: (id: string) => void;
  importChannels: (newChannels: Channel[]) => void;
  togglePlay: () => void;
  initialize: () => void;
}

// Helper to generate mock programs based on current time
export const generateMockPrograms = (channels: Channel[]): Program[] => {
  const now = Date.now();
  const programs: Program[] = [];
  
  channels.forEach(channel => {
    // Current program
    programs.push({
      id: `${channel.id}-p1`,
      channelId: channel.id,
      title: `${channel.name} Prime Time`,
      startTime: now - 1000 * 60 * 30, // Started 30 mins ago
      endTime: now + 1000 * 60 * 30,   // Ends in 30 mins
      description: `Live broadcast on ${channel.name} brought to you by ${channel.provider}.`,
      thumbnail: `https://picsum.photos/seed/${channel.id}1/400/225`
    });
    // Next program
    programs.push({
      id: `${channel.id}-p2`,
      channelId: channel.id,
      title: `Up Next: ${channel.category} Special`,
      startTime: now + 1000 * 60 * 30,
      endTime: now + 1000 * 60 * 90,
      description: `Stay tuned for exclusive content on ${channel.name}.`,
      thumbnail: `https://picsum.photos/seed/${channel.id}2/400/225`
    });
  });
  
  return programs;
};
