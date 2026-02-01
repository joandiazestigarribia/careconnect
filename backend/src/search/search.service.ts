import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaregiverProfile } from '../caregiver-profiles/entities/caregiver-profile.entity';
import { SearchCaregiversDto } from './dto/search-caregivers.dto';

export interface SearchResult {
  caregiver: CaregiverProfile;
  score: number;
  distance_km: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(CaregiverProfile)
    private caregiverRepo: Repository<CaregiverProfile>,
  ) {}

  async searchCaregivers(dto: SearchCaregiversDto): Promise<SearchResult[]> {
    const radiusMeters = (dto.radius_km || 5) * 1000;

    const query = this.caregiverRepo
      .createQueryBuilder('caregiver')
      .where(
        `ST_DWithin(
          caregiver.location,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius
        )`,
        {
          latitude: dto.latitude,
          longitude: dto.longitude,
          radius: radiusMeters,
        },
      )
      .andWhere('caregiver.location IS NOT NULL');

    if (dto.max_hourly_rate) {
      query.andWhere('caregiver.hourly_rate <= :max_rate', {
        max_rate: dto.max_hourly_rate,
      });
    }

    const caregivers = await query.getMany();

    const results = caregivers.map((caregiver) => {
      const distanceKm = this.calculateDistance(
        dto.latitude,
        dto.longitude,
        this.extractLatFromPoint(caregiver.location),
        this.extractLngFromPoint(caregiver.location),
      );

      const score = this.calculateScore(caregiver, distanceKm, dto);

      return {
        caregiver,
        score,
        distance_km: Math.round(distanceKm * 100) / 100,
      };
    });

    return results.sort((a, b) => b.score - a.score);
  }

  private calculateScore(
    caregiver: CaregiverProfile,
    distanceKm: number,
    dto: SearchCaregiversDto,
  ): number {
    let score = 0;

    const radiusKm = dto.radius_km || 5;
    const distanceScore = 40 * (1 - distanceKm / radiusKm);
    score += Math.max(0, distanceScore);

    score += Math.min(caregiver.trust_score || 0, 30);

    const rateScore = 20 * (1 - caregiver.hourly_rate / 5000);
    score += Math.max(0, Math.min(rateScore, 20));

    if (dto.preferred_languages?.length) {
      const matchingLangs = caregiver.languages_spoken.filter((lang) =>
        dto.preferred_languages!.includes(lang),
      ).length;
      score += 10 * (matchingLangs / dto.preferred_languages.length);
    } else {
      score += 10;
    }

    return Math.round(score);
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  private extractLatFromPoint(point: string | { type: string; coordinates: [number, number] } | null): number {
    if (!point) return 0;
    
    
    if (typeof point === 'object' && point.coordinates) {
      return point.coordinates[1]; 
    }
    
    
    if (typeof point === 'string') {
      const match = point.match(/POINT\([^ ]+ ([^)]+)\)/i);
      if (match) return parseFloat(match[1]);
      
      
      try {
        const parsed = JSON.parse(point);
        if (parsed.coordinates) return parsed.coordinates[1];
        } catch {
      }
    }
    
    return 0;
  }

  private extractLngFromPoint(point: string | { type: string; coordinates: [number, number] } | null): number {
    if (!point) return 0;
    
    
    if (typeof point === 'object' && point.coordinates) {
      return point.coordinates[0]; 
    }
    
    
    if (typeof point === 'string') {
      const match = point.match(/POINT\(([^ ]+) /i);
      if (match) return parseFloat(match[1]);
      
      
      try {
        const parsed = JSON.parse(point);
        if (parsed.coordinates) return parsed.coordinates[0];
      } catch {
        
      }
    }
    
    return 0;
  }
}
