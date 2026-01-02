
import { Channel } from './types';

export const CHARACTER_AVATARS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1618641986557-6ecd23ff9309?w=400&h=400&fit=crop',
    'https://img.freepik.com/free-photo/view-3d-man-wearing-goggles_23-2150709489.jpg?w=400',
    'https://img.freepik.com/free-photo/androgynous-avatar-active-user_23-2151130226.jpg?w=400',
    'https://img.freepik.com/free-photo/3d-rendering-boy-wearing-cap-with-letter-r_1142-40526.jpg?w=400',
];

export const COVER_SCENES = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200&h=400&fit=crop',
];

export const DEFAULT_CHANNELS: Channel[] = [
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
  }
];
