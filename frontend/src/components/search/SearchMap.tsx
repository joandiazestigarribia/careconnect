import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { type SearchResult } from '../../services/searchApi';
import { Star } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const userIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#3B82F6" flood-opacity="0.4"/>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="18" fill="#3B82F6" filter="url(#shadow)"/>
      <circle cx="20" cy="20" r="8" fill="white"/>
      <circle cx="20" cy="20" r="4" fill="#3B82F6"/>
    </svg>
  `,
  className: 'custom-user-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const createCaregiverIcon = (score: number) => {
  const getScoreColor = (s: number) => {
    if (s >= 90) return '#10B981'; 
    if (s >= 70) return '#3B82F6'; 
    if (s >= 50) return '#F472B6'; 
    return '#F59E0B'; 
  };
  
  const color = getScoreColor(score);
  
  return L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 56" width="48" height="56">
        <defs>
          <filter id="shadow-cg" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${color}" flood-opacity="0.3"/>
          </filter>
          <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.8" />
          </linearGradient>
        </defs>
        <path d="M24 0C14.5 0 7 7.5 7 17c0 12.8 17 35.5 17 35.5S41 29.8 41 17C41 7.5 33.5 0 24 0z" fill="url(#pinGradient)" filter="url(#shadow-cg)"/>
        <circle cx="24" cy="17" r="10" fill="white"/>
        <text x="24" y="21" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">${score}</text>
      </svg>
    `,
    className: 'custom-caregiver-marker',
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -50],
  });
};

interface Props {
  results: SearchResult[];
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}


const MapUpdater: React.FC<{ centerLat: number; centerLng: number; radiusKm: number }> = ({
  centerLat,
  centerLng,
  radiusKm,
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView([centerLat, centerLng], getZoomForRadius(radiusKm), {
      animate: true,
      duration: 1,
    });
  }, [centerLat, centerLng, radiusKm, map]);

  return null;
};


const getZoomForRadius = (radiusKm: number): number => {
  if (radiusKm <= 1) return 15;
  if (radiusKm <= 2) return 14;
  if (radiusKm <= 5) return 13;
  if (radiusKm <= 10) return 12;
  if (radiusKm <= 20) return 11;
  return 10;
};

const CaregiverPopupContent: React.FC<{ 
  result: SearchResult;
}> = ({ result }) => {
  const { caregiver, score } = result;
  
  const avatarUrl = `https://i.pravatar.cc/150?u=${caregiver.user_id}`;
  
  const sampleSkills = ['👶 Bebés', '🎨 Creativa', '🇬🇧 Inglés', '🍎 Cocina'];
  const displaySkills = caregiver.skills?.slice(0, 4) || sampleSkills;

  const getMatchLabel = (score: number) => {
    if (score >= 90) return { 
      text: '¡Super Match!', 
      color: 'from-success to-success-light', 
      bgColor: 'bg-success',
      description: 'es ideal para tu familia'
    };
    if (score >= 70) return { 
      text: '¡Excelente Match!', 
      color: 'from-primary to-primary-light', 
      bgColor: 'bg-primary',
      description: 'es excelente para tu familia'
    };
    if (score >= 50) return { 
      text: 'Buen Match', 
      color: 'from-accent to-accent-light', 
      bgColor: 'bg-accent',
      description: 'es buena para tu familia'
    };
    return { 
      text: 'Match Regular', 
      color: 'from-warning to-warning-light', 
      bgColor: 'bg-warning',
      description: 'podría ajustarse a tu familia'
    };
  };

  const matchInfo = getMatchLabel(score);

  const handleContactClick = () => {
    window.open(`/caregiver/${caregiver.user_id}`, '_blank');
  };

  return (
    <div className="min-w-[300px] font-sans">
      {/* Header con Score - Estilo HeroSection */}
      <div className="flex items-center gap-4 mb-5 pb-5 border-b-2 border-dashed border-border">
        <div className={`w-16 h-16 bg-linear-to-br ${matchInfo.color} rounded-2xl flex items-center justify-center shadow-lg shadow-success/30`}>
          <span className="text-3xl font-black text-white">{score}</span>
        </div>
        <div>
          <div className="text-xl font-bold text-text-primary">{matchInfo.text}</div>
          <p className="text-sm text-text-secondary mt-0.5">
            {caregiver.first_name} {matchInfo.description}
          </p>
        </div>
      </div>

      {/* Profile Info - Estilo HeroSection */}
      <div className="flex items-center gap-4 mb-5">
        <img 
          src={avatarUrl}
          alt={`${caregiver.first_name} ${caregiver.last_name}`}
          className="w-14 h-14 rounded-full object-cover shadow-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'w-14 h-14 bg-linear-to-br from-accent to-primary rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg';
              fallback.textContent = `${caregiver.first_name[0]}${caregiver.last_name[0]}`;
              parent.prepend(fallback);
            }
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary text-lg leading-tight">
            {caregiver.first_name} {caregiver.last_name}
          </h3>
          <p className="text-sm text-text-secondary mt-0.5">Cuidadora certificada</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-5 h-5 text-warning fill-warning" />
          <span className="font-bold text-text-primary text-lg">{caregiver.trust_score}</span>
        </div>
      </div>

      {/* Skills Tags - Estilo HeroSection */}
      <div className="flex flex-wrap gap-2 mb-5">
        {displaySkills.map((skill, index) => (
          <span 
            key={index}
            className="px-3 py-1.5 bg-bg-main rounded-xl text-sm font-medium text-text-secondary border border-border hover:border-primary/30 transition-colors"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Contact Button - Estilo HeroSection */}
      <button
        onClick={handleContactClick}
        className="w-full py-3.5 bg-linear-to-r from-primary to-primary-light text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 text-base"
      >
        ¡Contactar ahora!
      </button>
    </div>
  );
};

const SearchMap: React.FC<Props> = ({ results, centerLat, centerLng, radiusKm }) => {
  const validCenterLat = typeof centerLat === 'number' && !isNaN(centerLat) ? centerLat : -27.4511;
  const validCenterLng = typeof centerLng === 'number' && !isNaN(centerLng) ? centerLng : -58.9865;
  
  
  const radiusMeters = radiusKm * 1000;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[validCenterLat, validCenterLng]}
        zoom={getZoomForRadius(radiusKm)}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <MapUpdater centerLat={validCenterLat} centerLng={validCenterLng} radiusKm={radiusKm} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        
        <Marker position={[validCenterLat, validCenterLng]} icon={userIcon}>
          <Popup>
            <div className="text-sm">
              <strong>Tu ubicación</strong>
              <br />
              Lat: {validCenterLat.toFixed(6)}, Lng: {validCenterLng.toFixed(6)}
              <br />
              Radio: {radiusKm} km
            </div>
          </Popup>
        </Marker>

        
        <Circle
          center={[validCenterLat, validCenterLng]}
          radius={radiusMeters}
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1, weight: 2, dashArray: '5, 10' }}
        />

        
        {results.map((result) => {
          
          const location = result.caregiver.location;
          let lat: number;
          let lng: number;
          
          if (location && typeof location === 'object' && 'coordinates' in location) {
            lng = location.coordinates[0];
            lat = location.coordinates[1];
          } else {
            const angle = Math.random() * 2 * Math.PI;
            const distanceDegrees = result.distance_km / 111;
            lat = validCenterLat + Math.cos(angle) * distanceDegrees;
            lng = validCenterLng + Math.sin(angle) * distanceDegrees;
          }

          return (
            <Marker
              key={result.caregiver.user_id}
              position={[lat, lng]}
              icon={createCaregiverIcon(result.score)}
            >
              <Popup>
                <CaregiverPopupContent result={result} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default SearchMap;
