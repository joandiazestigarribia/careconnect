import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { type SearchResult } from '../../services/searchApi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


const createIcon = (color: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="25" height="41">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
};

const userIcon = createIcon('#3B82F6'); 
const caregiverIcon = createIcon('#10B981'); 

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
            <strong>Tu ubicación</strong>
            <br />
            Lat: {validCenterLat.toFixed(6)}, Lng: {validCenterLng.toFixed(6)}
            <br />
            Radio: {radiusKm} km
          </Popup>
        </Marker>

        
        <Circle
          center={[validCenterLat, validCenterLng]}
          radius={radiusMeters}
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1 }}
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
              icon={caregiverIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{result.caregiver.first_name} {result.caregiver.last_name}</strong>
                  <br />
                  Distancia: {result.distance_km} km
                  <br />
                  Tarifa: ${result.caregiver.hourly_rate}/h
                  <br />
                  Match: {result.score}/100
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default SearchMap;
