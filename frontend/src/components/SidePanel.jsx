import React, { useEffect, useState } from 'react';
import { getCountryDetails } from '../api';
import { X, ExternalLink, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SidePanel = ({ countryCode, countryName, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (countryCode) {
      setLoading(true);
      getCountryDetails(countryCode)
        .then(res => {
          setData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [countryCode]);

  if (!countryCode) return null;

  return (
    <div className="h-full w-full overflow-y-auto border-l border-white/10 bg-slate-900/60 p-4 text-white shadow-[-10px_0_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-transform sm:w-[28rem] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          {countryName} <Activity className="w-5 h-5 text-blue-400" />
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition">
          <X className="w-6 h-6" />
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-20 bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* AI Summary Section */}
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
            <h3 className="text-xs text-blue-400 uppercase tracking-wider mb-2 font-bold">AI Intelligence Summary</h3>
            <p className="text-sm text-blue-100 leading-relaxed italic">
              "{data?.ai_summary}"
            </p>
          </div>

          <div className="mb-4 flex flex-col gap-3 md:flex-row md:gap-4">
            <div className="flex-1 p-3 bg-slate-800 rounded-lg border border-slate-700">
              <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-1">Sentiment</h3>
              <div className={`text-md font-bold capitalize ${
                data?.overall_sentiment === 'positive' ? 'text-green-400' :
                data?.overall_sentiment === 'negative' ? 'text-red-400' : 'text-blue-400'
              }`}>
                {data?.overall_sentiment || 'Neutral'}
              </div>
            </div>
            
            {/* Currency Box */}
            {data?.currency && (
              <div className="flex-1 p-3 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-1">{data.currency.code} / USD</h3>
                <div className="text-md font-bold text-white">
                  {data.currency.rate !== "N/A" ? parseFloat(data.currency.rate).toFixed(2) : "N/A"}
                </div>
              </div>
            )}
            
            {data?.finance && data.finance.price !== "N/A" && (
              <div className="flex-1 p-3 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-1">{data.finance.ticker}</h3>
                <div className="text-md font-bold text-white">
                  ${data.finance.price}
                </div>
              </div>
            )}
          </div>

          {/* Financial Chart */}
          {data?.finance?.history?.length > 0 && (
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 mb-4 h-48">
              <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Market Trend (30 Days)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.finance.history}>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#60a5fa' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Cyber Security Section */}
          <div className="relative mt-6 overflow-hidden rounded-xl border border-gray-700/50 bg-slate-900/40 p-4">
            {/* Animated dashed border effect background */}
            <div className="absolute inset-0 border-2 border-dashed border-gray-600 opacity-20 rounded-xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
                Cyber Security
              </h3>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                data?.cyber_threat_level === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                data?.cyber_threat_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                'bg-green-500/20 text-green-400 border-green-500/50'
              }`}>
                Threat Level: {data?.cyber_threat_level || 'Low'}
              </div>
            </div>

            <p className="text-xs text-gray-400 italic mb-4 leading-relaxed bg-black/20 p-3 rounded border border-gray-800">
              {data?.cyber_ai_summary || "Monitoring network traffic and regional endpoints. No major anomalies detected."}
            </p>

            {(!data?.intelligence?.['Cyber Security'] || data.intelligence['Cyber Security'].length === 0) ? (
              <div className="text-xs text-slate-500 italic mb-2 bg-slate-800/30 p-2 rounded">No recent cyber incidents detected.</div>
            ) : (
              <div className="space-y-3">
                {data.intelligence['Cyber Security'].map((item, idx) => (
                  <div key={idx} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition">
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          item.sentiment === 'positive' ? 'bg-green-500/20 text-green-300' :
                          item.sentiment === 'negative' ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          Incident Report
                        </span>
                        {item.timestamp && (
                          <span className="text-[10px] text-gray-500 ml-2 italic">
                            {item.timestamp}
                          </span>
                        )}
                        {item.link && item.link !== '#' && (
                          <a href={item.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                    </div>
                    <h5 className="font-bold text-sm leading-tight mb-1 text-gray-200">{item.title}</h5>
                    <p className="text-gray-400 text-xs line-clamp-2">{item.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conflict & Geopolitics Section */}
          <div className="mt-6 p-4 bg-slate-900/40 rounded-xl border border-red-900/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-lg font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Conflict & Geopolitics
              </h3>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                data?.conflict_level === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                data?.conflict_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                'bg-green-500/20 text-green-400 border-green-500/50'
              }`}>
                Conflict Level: {data?.conflict_level || 'Low'}
              </div>
            </div>

            <p className="text-xs text-gray-400 italic mb-4 leading-relaxed bg-black/20 p-3 rounded border border-gray-800 relative z-10">
              {data?.conflict_ai_summary && data.conflict_ai_summary !== "No text available to summarize." ? data.conflict_ai_summary : "No major military activity detected in the region."}
            </p>

            {/* Alliances & Opponents */}
            <div className="relative z-10 mb-4 flex flex-col gap-3 md:flex-row md:gap-4">
              <div className="flex-1 p-3 bg-green-900/10 rounded-lg border border-green-800/30">
                <h3 className="text-xs text-green-400 uppercase tracking-wider mb-2 font-bold">Alliances</h3>
                <ul className="text-xs text-gray-300 space-y-1">
                  {data?.allies?.map((ally, i) => <li key={i}>• {ally}</li>)}
                </ul>
              </div>
              <div className="flex-1 p-3 bg-red-900/10 rounded-lg border border-red-800/30">
                <h3 className="text-xs text-red-400 uppercase tracking-wider mb-2 font-bold">Opponents</h3>
                <ul className="text-xs text-gray-300 space-y-1">
                  {data?.opponents?.map((opp, i) => <li key={i}>• {opp}</li>)}
                </ul>
              </div>
            </div>

            <div className="relative z-10">
              {(!data?.intelligence?.['Conflict'] || data.intelligence['Conflict'].length === 0) ? (
                <div className="text-xs text-slate-500 italic mb-2 bg-slate-800/30 p-2 rounded">No recent conflict headlines.</div>
              ) : (
                <div className="space-y-3">
                  {data.intelligence['Conflict'].map((item, idx) => (
                    <div key={idx} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition">
                      <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            item.sentiment === 'positive' ? 'bg-green-500/20 text-green-300' :
                            item.sentiment === 'negative' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            Defense Update
                          </span>
                          {item.timestamp && (
                            <span className="text-[10px] text-gray-500 ml-2 italic">
                              {item.timestamp}
                            </span>
                          )}
                          {item.link && item.link !== '#' && (
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                      </div>
                      <h5 className="font-bold text-sm leading-tight mb-1 text-gray-200">{item.title}</h5>
                      <p className="text-gray-400 text-xs line-clamp-2">{item.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-4 rounded-md border border-slate-700 bg-slate-800 p-2 text-center text-lg font-bold sm:text-xl">
              Detailed Briefing
            </h3>
            
            {/* Render Categories */}
            {[
              { key: 'Politics', title: 'Politics & Global Relations' },
              { key: 'Government', title: 'Government & Laws' },
              { key: 'Economy', title: 'Economy & Finance' },
              { key: 'Technology', title: 'Technology Updates' },
              { key: 'News', title: 'Latest General News' }
            ].map(cat => (
              <div key={cat.key} className="mb-6">
                <h4 className="mb-3 border-b border-slate-700 pb-1 text-sm font-semibold text-slate-200 sm:text-base">
                  {cat.title}
                </h4>
                {(!data?.intelligence?.[cat.key] || data.intelligence[cat.key].length === 0) ? (
                  <div className="text-xs text-slate-500 italic mb-4 bg-slate-800/30 p-2 rounded">No recent updates available in this category.</div>
                ) : (
                  <div className="space-y-3">
                    {data.intelligence[cat.key].map((item, idx) => (
                      <div key={idx} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition">
                        <div className="flex justify-between items-start mb-1">
                           <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                             item.sentiment === 'positive' ? 'bg-green-500/20 text-green-300' :
                             item.sentiment === 'negative' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                           }`}>
                             {item.sentiment}
                           </span>
                           {item.timestamp && (
                             <span className="text-[10px] text-slate-400 ml-2 italic">
                               {item.timestamp}
                             </span>
                           )}
                           {item.link && item.link !== '#' && (
                             <a href={item.link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                               <ExternalLink className="w-3 h-3" />
                             </a>
                           )}
                        </div>
                        <h5 className="font-bold text-sm leading-tight mb-1 text-white">{item.title}</h5>
                        <p className="text-slate-400 text-xs line-clamp-2">{item.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidePanel;
