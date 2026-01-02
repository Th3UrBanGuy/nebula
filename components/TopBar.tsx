
import React, { useEffect, useState } from 'react';
import { Wifi, Signal, Cloud, MapPin, Sun, CloudRain, Snowflake, CloudLightning, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store';

export const TopBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { user, setView } = useStore();
  
  // Weather & Location State
  const [weather, setWeather] = useState<{temp: number, code: number} | null>(null);
  const [locationName, setLocationName] = useState<string>("Locating...");
  const [isLoadingLoc, setIsLoadingLoc] = useState(true);
  
  // Time updater
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Location & Weather Fetcher
  useEffect(() => {
    if (!("geolocation" in navigator)) {
        setLocationName("N/A");
        setIsLoadingLoc(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // 1. Fetch Weather (Open-Meteo Free API)
        try {
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            if (wRes.ok) {
                const wData = await wRes.json();
                setWeather({ 
                    temp: Math.round(wData.current_weather.temperature), 
                    code: wData.current_weather.weathercode 
                });
            }
        } catch (e) { 
            console.error("Weather fetch failed", e); 
        }

        // 2. Fetch Place Name (Nominatim / OpenStreetMap Reverse Geocoding)
        try {
            const lRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (lRes.ok) {
                const lData = await lRes.json();
                const addr = lData.address;
                // Prioritize City > Town > Village > County
                const city = addr.city || addr.town || addr.village || addr.county || "Unknown Location";
                const country = addr.country_code?.toUpperCase() || "";
                setLocationName(`${city}, ${country}`);
            } else {
                setLocationName("Local Area");
            }
        } catch (e) { 
            setLocationName("Local Signal"); 
        } finally {
            setIsLoadingLoc(false);
        }

    }, (error) => {
          console.warn("Geolocation access denied or failed", error);
          setLocationName("Signal Lost");
          setIsLoadingLoc(false);
    });
  }, []);

  // Helper to map WMO Weather Codes to Icons
  const getWeatherIcon = (code: number) => {
      if (code === 0 || code === 1) return <Sun className="w-4 h-4 text-orange-400" />;
      if (code >= 51 && code <= 67) return <CloudRain className="w-4 h-4 text-blue-400" />;
      if (code >= 80 && code <= 82) return <CloudRain className="w-4 h-4 text-blue-400" />;
      if (code >= 71 && code <= 86) return <Snowflake className="w-4 h-4 text-white" />;
      if (code >= 95) return <CloudLightning className="w-4 h-4 text-purple-400" />;
      return <Cloud className="w-4 h-4 text-stone-400" />; // Default cloud for overcast/fog/unknown
  };

  return (
    <div className="w-full h-20 flex items-start justify-between px-6 md:px-10 py-6 z-20 pointer-events-none">
      
      {/* Left: Branding & Status */}
      <div className="flex flex-col pointer-events-auto">
         <div className="flex items-center space-x-2 mb-1">
             <div className="w-8 h-8 bg-gradient-to-br from-stone-800 to-stone-900 rounded-lg flex items-center justify-center border border-stone-700/50 shadow-lg">
                <span className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">N</span>
             </div>
             <span className="text-sm font-bold text-stone-300 tracking-widest uppercase">Nebula OS</span>
         </div>
         
         <div className="flex items-center space-x-3 text-[10px] font-mono text-stone-500 ml-1">
            <span className="flex items-center"><Signal className="w-3 h-3 mr-1" /> 5G</span>
            <span>•</span>
            <span className="flex items-center"><Wifi className="w-3 h-3 mr-1" /> Connected</span>
         </div>
      </div>

      {/* Right: Time & Widget */}
      <div className="flex items-center space-x-4 pointer-events-auto">
        
        {/* Real Weather Widget */}
        <div className="hidden md:flex items-center bg-stone-950/30 backdrop-blur-md border border-stone-800/50 rounded-full px-4 py-2 space-x-3 shadow-lg">
            <div className="flex items-center space-x-2 text-stone-300">
                {weather ? getWeatherIcon(weather.code) : <Cloud className="w-4 h-4 text-stone-500" />}
                <span className="text-xs font-bold">{weather ? `${weather.temp}°C` : '--'}</span>
            </div>
            <div className="w-px h-3 bg-stone-700" />
            <div className="flex items-center space-x-1 text-stone-400">
                {isLoadingLoc ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                <span className="text-[10px] font-bold uppercase tracking-wider max-w-[150px] truncate">
                    {locationName}
                </span>
            </div>
        </div>

        {/* Time Display */}
        <div className="text-right">
           <h2 className="text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">
               {format(time, 'HH:mm')}
           </h2>
           <p className="text-xs font-bold text-orange-500 uppercase tracking-widest text-right">
               {format(time, 'EEE, MMM d')}
           </p>
        </div>

        <button 
          onClick={() => setView('profile')}
          className="ml-2 w-10 h-10 rounded-full bg-gradient-to-tr from-stone-700 to-stone-600 p-0.5 shadow-lg cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all group relative"
        >
            <img 
              src={user?.avatar || "https://i.pravatar.cc/150?u=def"} 
              alt="User" 
              className="w-full h-full rounded-full object-cover border-2 border-stone-900 group-hover:brightness-110" 
            />
            {user?.role === 'admin' && (
                <div className="absolute -top-1 -right-1 bg-red-600 text-[8px] font-black px-1.5 py-0.5 rounded text-white border border-black">ADM</div>
            )}
        </button>
      </div>
    </div>
  );
};
