import { Injectable } from '@nestjs/common';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  display_name: string;
}

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

@Injectable()
export class GeocodingService {
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

  async geocode(address: string): Promise<GeocodingResult | null> {
    try {
      const params = new URLSearchParams({
        q: address,
        format: 'json',
        limit: '1',
      });

      const response = await fetch(`${this.NOMINATIM_URL}?${params}`, {
        headers: {
          'User-Agent': 'CareConnect/1.0',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return null;
      }

      const result = data[0];

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        display_name: result.display_name,
      };
    } catch {
      return null;
    }
  }

  createPoint(longitude: number, latitude: number): GeoJSONPoint {
    return {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  }
}
