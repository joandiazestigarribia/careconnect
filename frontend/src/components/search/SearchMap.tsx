import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { type SearchResult, type FamilySearchResult } from '../../services/searchApi';
import { Star, Users } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type MapType = 'caregivers' | 'families';

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

const createFamilyIcon = (score: number) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10B981';
    if (s >= 60) return '#3B82F6';
    return '#F59E0B';
  };
  
  const color = getScoreColor(score);
  
  return L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <defs>
          <filter id="shadow-family" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.4"/>
          </filter>
        </defs>
        <circle cx="24" cy="24" r="20" fill="${color}" fill-opacity="0.9" filter="url(#shadow-family)"/>
        <circle cx="24" cy="24" r="14" fill="white"/>
        <text x="24" y="29" text-anchor="middle" font-size="12" font-weight="bold" fill="${color}">${score}</text>
      </svg>
    `,
    className: 'custom-family-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
};

interface BaseProps {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}

interface CaregiverProps extends BaseProps {
  type?: 'caregivers';
  results: SearchResult[];
  familyResults?: never;
}

interface FamilyProps extends BaseProps {
  type: 'families';
  results?: never;
  familyResults: FamilySearchResult[];
}

type Props = CaregiverProps | FamilyProps;

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

interface MapResult {
  id: string;
  name: string;
  score: number;
  distance_km: number;
  lat: number;
  lng: number;
  subtitle: string;
  extraInfo?: string;
  tags?: string[];
  avatarId: string;
  linkPath: string;
}

const UnifiedPopupContent: React.FC<{ 
  result: MapResult;
  type: MapType;
}> = ({ result, type }) => {
  const { name, score, subtitle, extraInfo, tags, avatarId, linkPath } = result;
  
  const avatarUrl = `https://i.pravatar.cc/150?u=${avatarId}`;

  const getMatchLabel = (score: number) => {
    if (type === 'families') {
      if (score >= 80) return { 
        text: '¡Excelente Match!', 
        color: 'from-success to-success-light', 
        description: 'es excelente para ti'
      };
      if (score >= 60) return { 
        text: '¡Buen Match!', 
        color: 'from-primary to-primary-light', 
        description: 'podría ser una buena opción'
      };
      return { 
        text: 'Match Regular', 
        color: 'from-warning to-warning-light', 
        description: 'podrías considerarla'
      };
    } else {
      if (score >= 90) return { 
        text: '¡Super Match!', 
        color: 'from-success to-success-light', 
        description: 'es ideal para tu familia'
      };
      if (score >= 70) return { 
        text: '¡Excelente Match!', 
        color: 'from-primary to-primary-light', 
        description: 'es excelente para tu familia'
      };
      if (score >= 50) return { 
        text: 'Buen Match', 
        color: 'from-accent to-accent-light', 
        description: 'es buena para tu familia'
      };
      return { 
        text: 'Match Regular', 
        color: 'from-warning to-warning-light', 
        description: 'podría ajustarse a tu familia'
      };
    }
  };

  const matchInfo = getMatchLabel(score);

  const handleContactClick = () => {
    window.open(linkPath, '_blank');
  };

  return (
    <div className="min-w-[280px] font-sans">
      {/* Header con Score */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-dashed border-border">
        <div className={`w-14 h-14 bg-linear-to-br ${matchInfo.color} rounded-2xl flex items-center justify-center shadow-lg`}>
          <span className="text-2xl font-black text-white">{score}</span>
        </div>
        <div>
          <div className="text-lg font-bold text-text-primary">{matchInfo.text}</div>
          <p className="text-xs text-text-secondary mt-0.5">
            {name} {matchInfo.description}
          </p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex items-center gap-3 mb-4">
        <img 
          src={avatarUrl}
          alt={name}
          className="w-12 h-12 rounded-full object-cover shadow-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'w-12 h-12 bg-linear-to-br from-accent to-primary rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg';
              fallback.textContent = name.charAt(0).toUpperCase();
              parent.prepend(fallback);
            }
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary text-base leading-tight">
            {name}
          </h3>
          <p className="text-sm text-text-secondary mt-0.5">
            {subtitle}
          </p>
          {extraInfo && (
            <p className="text-xs text-text-muted mt-0.5">{extraInfo}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {type === 'families' ? (
            <Users className="w-4 h-4 text-primary" />
          ) : (
            <Star className="w-4 h-4 text-warning fill-warning" />
          )}
        </div>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-bg-main rounded-lg text-xs font-medium text-text-secondary border border-border"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-1 bg-bg-main text-text-muted rounded-lg text-xs font-medium border border-border">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Contact Button */}
      <button
        onClick={handleContactClick}
        className="w-full py-3 bg-linear-to-r from-primary to-primary-light text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 text-sm"
      >
        ¡Contactar ahora!
      </button>
    </div>
  );
};

const SearchMap: React.FC<Props> = ({ 
  results, 
  familyResults,
  centerLat, 
  centerLng, 
  radiusKm, 
  type = 'caregivers' 
}) => {
  const validCenterLat = typeof centerLat === 'number' && !isNaN(centerLat) ? centerLat : -27.4511;
  const validCenterLng = typeof centerLng === 'number' && !isNaN(centerLng) ? centerLng : -58.9865;
  
  const radiusMeters = radiusKm * 1000;

  const mapResults: MapResult[] = React.useMemo(() => {
    if (type === 'families' && familyResults) {
      return familyResults.map(fr => {
        const location = fr.family.location;
        let lat: number;
        let lng: number;
        
        if (location && typeof location === 'object' && 'coordinates' in location) {
          lng = location.coordinates[0];
          lat = location.coordinates[1];
        } else {
          const angle = Math.random() * 2 * Math.PI;
          const distanceDegrees = fr.distance_km / 111;
          lat = validCenterLat + Math.cos(angle) * distanceDegrees;
          lng = validCenterLng + Math.sin(angle) * distanceDegrees;
        }

        let ageText = 'Edades no especificadas';
        if (fr.family.children_ages && fr.family.children_ages.length > 0) {
          const minAge = Math.min(...fr.family.children_ages);
          const maxAge = Math.max(...fr.family.children_ages);
          ageText = minAge === maxAge ? `${minAge} años` : `${minAge}-${maxAge} años`;
        }

        return {
          id: fr.family.user_id,
          name: `${fr.family.family_name}`,
          score: fr.score,
          distance_km: fr.distance_km,
          lat,
          lng,
          subtitle: `${fr.family.children_count} hijo(s) • ${ageText}`,
          extraInfo: fr.family.languages_preferred?.join(', '),
          tags: fr.family.special_needs || [],
          avatarId: fr.family.user_id,
          linkPath: `/family/${fr.family.user_id}`,
        };
      });
    } else if (results) {
      return results.map(r => {
        const location = r.caregiver.location;
        let lat: number;
        let lng: number;
        
        if (location && typeof location === 'object' && 'coordinates' in location) {
          lng = location.coordinates[0];
          lat = location.coordinates[1];
        } else {
          const angle = Math.random() * 2 * Math.PI;
          const distanceDegrees = r.distance_km / 111;
          lat = validCenterLat + Math.cos(angle) * distanceDegrees;
          lng = validCenterLng + Math.sin(angle) * distanceDegrees;
        }

        return {
          id: r.caregiver.user_id,
          name: `${r.caregiver.first_name} ${r.caregiver.last_name}`,
          score: r.score,
          distance_km: r.distance_km,
          lat,
          lng,
          subtitle: `Cuidadora certificada`,
          extraInfo: `${r.caregiver.languages_spoken?.slice(0, 2).join(', ')}`,
          tags: r.caregiver.skills?.slice(0, 3) || [],
          avatarId: r.caregiver.user_id,
          linkPath: `/caregiver/${r.caregiver.user_id}`,
        };
      });
    }
    return [];
  }, [results, familyResults, type, validCenterLat, validCenterLng]);

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

        {mapResults.map((result) => (
          <Marker
            key={result.id}
            position={[result.lat, result.lng]}
            icon={type === 'families' ? createFamilyIcon(result.score) : createCaregiverIcon(result.score)}
          >
            <Popup>
              <UnifiedPopupContent result={result} type={type} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default SearchMap;
