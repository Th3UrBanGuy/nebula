export type ViewState = 'home' | 'guide' | 'player' | 'ai' | 'settings';

export interface Channel {
  id: string;
  number: string;
  name: string;
  logo: string;
  provider: string; // e.g., 'Akash Net', 'Global Sat', 'Local Stream'
  category: string;
  color: string; // CSS class for gradient/bg
  description: string;
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
  view: ViewState;
  activeChannelId: string;
  isPlaying: boolean;
  volume: number;
  channels: Channel[];
  programs: Program[];
  isLoading: boolean;
  setView: (view: ViewState) => void;
  setChannel: (channelId: string) => void;
  togglePlay: () => void;
  initialize: () => void;
}

export const MOCK_CHANNELS: Channel[] = [
  // Akash Net Provider
  { id: 'a1', number: '101', name: 'Akash News', provider: 'Akash Net', category: 'News', color: 'bg-gradient-to-br from-red-600 to-orange-600', logo: 'AN', description: '24/7 Breaking news from the Akash Network.' },
  { id: 'a2', number: '102', name: 'Akash Movies', provider: 'Akash Net', category: 'Movies', color: 'bg-gradient-to-br from-orange-500 to-amber-500', logo: 'AM', description: 'Premium blockbuster movies ad-free.' },
  { id: 'a3', number: '103', name: 'Akash Sports', provider: 'Akash Net', category: 'Sports', color: 'bg-gradient-to-br from-red-700 to-red-500', logo: 'AS', description: 'Live cricket, football, and tennis.' },
  
  // Global Sat Provider
  { id: 'g1', number: '201', name: 'Discovery Solar', provider: 'Global Sat', category: 'Documentary', color: 'bg-gradient-to-br from-yellow-500 to-amber-600', logo: 'DS', description: 'Science, nature, and the universe.' },
  { id: 'g2', number: '202', name: 'Toon Blast', provider: 'Global Sat', category: 'Kids', color: 'bg-gradient-to-br from-orange-400 to-pink-500', logo: 'TB', description: 'Cartoons and anime for all ages.' },
  
  // StreamHub Provider
  { id: 's1', number: '301', name: 'Music Fire', provider: 'StreamHub', category: 'Music', color: 'bg-gradient-to-br from-rose-500 to-orange-500', logo: 'MF', description: 'Hottest hits and trending music videos.' },
  { id: 's2', number: '302', name: 'Tech Core', provider: 'StreamHub', category: 'Tech', color: 'bg-gradient-to-br from-stone-600 to-stone-400', logo: 'TC', description: 'Deep dives into software and hardware.' },
  { id: 's3', number: '303', name: 'Retro TV', provider: 'StreamHub', category: 'Classics', color: 'bg-gradient-to-br from-amber-700 to-yellow-600', logo: 'RT', description: 'Classic sitcoms and dramas from the 80s and 90s.' },
];

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