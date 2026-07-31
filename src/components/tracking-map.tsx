import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { Store, Home, ShieldCheck } from 'lucide-react';

interface TrackingMapProps {
  progressPct: number; // 0 to 1
  isDelivered: boolean;
}

// Coordinates (New Delhi example)
const origin: [number, number] = [28.6139, 77.2090]; 
const destination: [number, number] = [28.6239, 77.2190]; 

// Create custom icons using Lucide icons rendered to HTML
const createCustomIcon = (icon: React.ReactNode, bgColor: string, pulse: boolean = false) => {
  const html = renderToStaticMarkup(
    <div style={{
      width: '36px', height: '36px', 
      backgroundColor: bgColor, 
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      border: '3px solid white',
      position: 'relative'
    }}>
      {pulse && (
        <div style={{
          position: 'absolute', inset: -10, borderRadius: '50%',
          backgroundColor: bgColor, opacity: 0.3, zIndex: -1,
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
      )}
      {icon}
    </div>
  );

  return L.divIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const storeIcon = createCustomIcon(<Store size={18} color="white" />, '#334155'); // Slate 700
const homeIcon = createCustomIcon(<Home size={18} color="white" />, '#10B981', true); // Emerald 500

const bikeIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div style={{
      width: '44px', height: '44px', 
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      backgroundColor: 'white',
      padding: '2px',
      position: 'relative'
    }}>
      <img 
        src="https://i.pravatar.cc/150?img=11" 
        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
        alt="rider"
      />
      <div style={{
        position: 'absolute', bottom: -2, right: -2, 
        backgroundColor: 'white', borderRadius: '50%', padding: '2px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <ShieldCheck size={12} color="#10B981" />
      </div>
    </div>
  ),
  className: 'custom-bike-icon',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

// Component to dynamically fit bounds or pan to bike
function MapController({ bikePos }: { bikePos: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    // On mount, fit bounds to origin and destination with padding
    const bounds = L.latLngBounds([origin, destination]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map]);

  useEffect(() => {
    // Optionally pan slightly towards bike as it moves (smoothly)
    // For a short distance, keeping both in view is usually better, so we just let it be.
  }, [bikePos, map]);

  return null;
}

export default function TrackingMap({ progressPct, isDelivered }: TrackingMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Add global keyframes for the pulse animation if not exists
    if (!document.getElementById('leaflet-pulse-css')) {
      const style = document.createElement('style');
      style.id = 'leaflet-pulse-css';
      style.innerHTML = `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .3; transform: scale(1.3); }
        }
        .custom-leaflet-icon, .custom-bike-icon {
          background: transparent;
          border: none;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!isClient) {
    return <div className="w-full h-full bg-[#E8F0EB] animate-pulse" />;
  }

  // Calculate current bike position based on progress
  const lat = origin[0] + (destination[0] - origin[0]) * progressPct;
  const lng = origin[1] + (destination[1] - origin[1]) * progressPct;
  const bikePos: [number, number] = [lat, lng];

  return (
    <MapContainer 
      center={origin} 
      zoom={14} 
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full z-10"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {/* Route background */}
      <Polyline 
        positions={[origin, destination]} 
        color="#B0D9B1" 
        weight={6}
        dashArray="10, 10"
      />

      {/* Completed route */}
      <Polyline 
        positions={[origin, bikePos]} 
        color="#10B981" 
        weight={6}
      />

      <Marker position={origin} icon={storeIcon} />
      <Marker position={destination} icon={homeIcon} />
      {!isDelivered && (
        <Marker position={bikePos} icon={bikeIcon} zIndexOffset={1000} />
      )}
      
      <MapController bikePos={bikePos} />
    </MapContainer>
  );
}
