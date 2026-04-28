import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';

const GlobeViz = ({ onCountryClick, sentimentData, isPaused }) => {
  const globeRef = useRef();
  const [countries, setCountries] = useState({ features: [] });
  const [hoverD, setHoverD] = useState(null);

  // Predefined relationship arcs
  const arcsData = [
    { startLat: 39.9, startLng: 116.4, endLat: 38.9, endLng: -77.0, type: 'conflict', label: 'China ↔ USA: Conflict' },
    { startLat: 51.5, startLng: -0.1, endLat: 38.9, endLng: -77.0, type: 'alliance', label: 'UK ↔ USA: Alliance' },
    { startLat: 28.6, startLng: 77.2, endLat: 38.9, endLng: -77.0, type: 'military', label: 'India ↔ USA: Military Cooperation' },
    { startLat: 55.7, startLng: 37.6, endLat: 39.9, endLng: 116.4, type: 'alliance', label: 'Russia ↔ China: Alliance' },
    { startLat: 55.7, startLng: 37.6, endLat: 38.9, endLng: -77.0, type: 'conflict', label: 'Russia ↔ USA: Conflict' },
    { startLat: 48.8, startLng: 2.3, endLat: 51.5, endLng: -0.1, type: 'neutral', label: 'France ↔ UK: Neutral' },
    { startLat: 35.6, startLng: 139.6, endLat: 38.9, endLng: -77.0, type: 'military', label: 'Japan ↔ USA: Military Cooperation' },
    { startLat: -15.7, startLng: -47.8, endLat: 39.9, endLng: 116.4, type: 'neutral', label: 'Brazil ↔ China: Neutral' },
    { startLat: 38.9, startLng: -77.0, endLat: 55.7, endLng: 37.6, type: 'cyber', label: 'USA ↔ Russia: Cyber Activity' },
    { startLat: 39.9, startLng: 116.4, endLat: 28.6, endLng: 77.2, type: 'conflict', label: 'China ↔ India: Border Conflict' },
  ];

  const getArcColor = (type) => {
    switch (type) {
      case 'conflict': return 'rgba(239, 68, 68, 1)'; // Solid Red
      case 'alliance': return 'rgba(34, 197, 94, 0.8)'; // Green
      case 'military': return 'rgba(234, 179, 8, 0.8)'; // Yellow
      case 'neutral': return 'rgba(59, 130, 246, 0.8)'; // Blue
      case 'cyber': return 'rgba(156, 163, 175, 0.8)'; // Gray
      default: return 'rgba(255, 255, 255, 0.5)';
    }
  };

  useEffect(() => {
    // Fetch GeoJSON for countries
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);
  }, []);

  useEffect(() => {
    // Auto-rotate the globe slowly, pause when a country is selected
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = !isPaused;
      globeRef.current.controls().autoRotateSpeed = 0.3; // Very slow and easy to click
    }
  }, [isPaused]);

  useEffect(() => {
    // Initial zoomed out state
    if (globeRef.current) {
      globeRef.current.pointOfView({ altitude: 8 }, 0);
    }
  }, []);

  useEffect(() => {
    // One-time automatic zoom into India after the globe loads
    const timer = setTimeout(() => {
      if (globeRef.current) {
        globeRef.current.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 1.2 }, 1500);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const getPolygonColor = (feat) => {
    const isoCode = feat.properties.ISO_A2;
    const countryData = sentimentData.find(c => c.iso === isoCode);
    
    if (countryData) {
      if (countryData.sentiment === 'positive') return 'rgba(34, 197, 94, 0.2)'; // Green transparent
      if (countryData.sentiment === 'negative') return 'rgba(239, 68, 68, 0.2)'; // Red transparent
      return 'rgba(59, 130, 246, 0.2)'; // Blue transparent (neutral)
    }
    // Default color
    return 'rgba(148, 163, 184, 0.05)'; // Very transparent slate
  };

  return (
    <div className="absolute left-0 top-0 h-[100dvh] w-full cursor-grab bg-black active:cursor-grabbing">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        polygonsData={countries.features}
        polygonAltitude={d => d === hoverD ? 0.08 : 0.01}
        polygonCapColor={d => d === hoverD ? 'rgba(255, 255, 255, 0.4)' : getPolygonColor(d)}
        polygonSideColor={() => 'rgba(255, 255, 255, 0.05)'}
        polygonStrokeColor={() => 'rgba(255, 255, 255, 0.4)'}
        showAtmosphere={true}
        atmosphereColor="#3a228a"
        atmosphereAltitude={0.15}
        polygonLabel={({ properties: d }) => `
          <b>${d.ADMIN} (${d.ISO_A2})</b>
        `}
        
        // HTML Notification Badges
        htmlElementsData={sentimentData.filter(d => d.notifications > 0)}
        htmlLat={d => d.lat}
        htmlLng={d => d.lng}
        htmlElement={d => {
          const el = document.createElement('div');
          el.innerHTML = `🔴 ${d.notifications}`;
          el.style.color = 'white';
          el.style.fontSize = '12px';
          el.style.fontWeight = 'bold';
          el.style.background = 'rgba(0,0,0,0.6)';
          el.style.backdropFilter = 'blur(4px)';
          el.style.padding = '2px 6px';
          el.style.borderRadius = '12px';
          el.style.pointerEvents = 'none';
          el.style.border = '1px solid rgba(255,255,255,0.2)';
          return el;
        }}
        
        onPolygonHover={setHoverD}
        onPolygonClick={onCountryClick}
        polygonsTransitionDuration={300}
        
        // Arcs configuration
        arcsData={arcsData}
        arcStartLat={d => d.startLat}
        arcStartLng={d => d.startLng}
        arcEndLat={d => d.endLat}
        arcEndLng={d => d.endLng}
        arcColor={d => getArcColor(d.type)}
        arcDashLength={d => d.type === 'cyber' ? 0.05 : 0.4}
        arcDashGap={d => d.type === 'cyber' ? 0.05 : 0.2}
        arcDashAnimateTime={d => d.type === 'cyber' ? 800 : 2500}
        arcStroke={d => d.type === 'conflict' ? 1.5 : (d.type === 'cyber' ? 0.5 : 0.8)}
        arcLabel={d => `
          <div style="background: rgba(0,0,0,0.8); padding: 4px 8px; border-radius: 4px; border: 1px solid ${getArcColor(d.type)};">
            <b style="color: white; font-size: 12px;">${d.label}</b>
          </div>
        `}
      />
    </div>
  );
};

export default GlobeViz;
