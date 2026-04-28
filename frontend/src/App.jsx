import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import GlobeViz from './components/GlobeViz';
import SidePanel from './components/SidePanel';
import { getGlobeData } from './api';
import { LogOut } from 'lucide-react';
import api from './api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [globeData, setGlobeData] = useState([]);



  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchGlobeData();
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchGlobeData = async () => {
    try {
      const res = await getGlobeData();
      setGlobeData(res.data.countries);
    } catch (err) {
      console.error("Failed to fetch globe data", err);
      if (err.response?.status === 401) setToken(null);
    }
  };

  const handleCountryClick = (polygon) => {
    setSelectedCountry({
      code: polygon.properties.ISO_A2,
      name: polygon.properties.ADMIN
    });
  };

  const handleLogout = () => {
    setToken(null);
    setSelectedCountry(null);
  };

  if (!token) {
    return <Auth onLogin={(t) => { setToken(t); }} />;
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute left-0 top-0 z-10 flex w-full items-start justify-between p-3 pointer-events-none sm:p-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] sm:text-3xl">
            GLOBAL<span className="text-blue-500">INTEL</span>
          </h1>
          
          {/* Legend Box (Top-Left) */}
          <div className="mt-3 w-[calc(100vw-1.5rem)] max-w-xs rounded-xl border border-slate-700 bg-slate-900/80 p-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md pointer-events-auto sm:mt-6 sm:w-64 sm:p-4">
            <h3 className="mb-2 border-b border-slate-700 pb-1 text-sm font-bold text-white">Status Legend</h3>
            
            <div className="space-y-2 text-[10px] sm:space-y-3 sm:text-xs">
              <div>
                <p className="mb-1 font-semibold text-slate-300">Country Sentiment:</p>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500 opacity-80"></span> <span className="text-slate-400">Positive</span></div>
                <div className="mt-1 flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500 opacity-80"></span> <span className="text-slate-400">Negative</span></div>
                <div className="mt-1 flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500 opacity-80"></span> <span className="text-slate-400">Neutral</span></div>
              </div>
              
              <div className="hidden border-t border-slate-700/50 pt-2 sm:block">
                <p className="mb-1 font-semibold text-slate-300">Relationship Arcs:</p>
                <div className="flex items-center gap-2"><div className="h-1 w-4 bg-red-500"></div> <span className="text-slate-400">Conflict / War</span></div>
                <div className="mt-1 flex items-center gap-2"><div className="h-1 w-4 bg-yellow-500"></div> <span className="text-slate-400">Military Cooperation</span></div>
                <div className="mt-1 flex items-center gap-2"><div className="h-1 w-4 bg-green-500"></div> <span className="text-slate-400">Alliance / Positive Relations</span></div>
                <div className="mt-1 flex items-center gap-2"><div className="h-1 w-4 bg-blue-500"></div> <span className="text-slate-400">Neutral Relationship</span></div>
                <div className="mt-1 flex items-center gap-2"><div className="h-1 w-4 bg-gray-400"></div> <span className="text-slate-400">Cybersecurity Activity</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Globe */}
      <div className="w-full h-full absolute inset-0">
        <GlobeViz 
          onCountryClick={handleCountryClick} 
          sentimentData={globeData} 
          isPaused={!!selectedCountry} 
        />
      </div>

      {/* Side Panel */}
      <div className={`absolute right-0 top-0 h-full w-full transition-transform duration-300 ease-in-out sm:w-[28rem] ${selectedCountry ? 'translate-x-0' : 'translate-x-full'}`}>
         {selectedCountry && (
           <SidePanel 
             countryCode={selectedCountry.code} 
             countryName={selectedCountry.name}
             onClose={() => setSelectedCountry(null)} 
           />
         )}
      </div>

      {/* Logout Button (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-auto sm:bottom-6 sm:left-6">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-red-500/50 bg-red-600/80 px-4 py-2.5 text-sm font-semibold tracking-wide text-white shadow-[0_4px_30px_rgba(239,68,68,0.3)] transition hover:bg-red-500 backdrop-blur-lg sm:px-6 sm:py-3 sm:text-base"
        >
          <LogOut className="w-5 h-5" /> Secure Logout
        </button>
      </div>
      
      {/* Copyright Box (Bottom-Center) */}
      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 transform pointer-events-none sm:bottom-6">
        <div className="hidden rounded-full border border-slate-700/50 bg-slate-900/80 px-6 py-2 shadow-lg sm:block">
          <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
            &copy; GuhanSenthil2026 | Legal & Secure
          </span>
        </div>
      </div>
      {/* Instructions Overlay */}
      {!selectedCountry && (
        <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 select-none text-sm uppercase tracking-widest text-slate-300/80 pointer-events-none sm:block sm:bottom-10">
          Click on a country to view intel
        </div>
      )}
    </div>
  );
}

export default App;
