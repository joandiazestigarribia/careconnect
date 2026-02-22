import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyProfile } from './entities/family-profile.entity';
import { CreateFamilyProfileDto } from './dto/create-family-profile.dto';
import { UpdateFamilyProfileDto } from './dto/update-family-profile.dto';
import { GeocodingService } from '../geocoding/geocoding.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class FamilyProfilesService {
  constructor(
    @InjectRepository(FamilyProfile)
    private familyProfileRepository: Repository<FamilyProfile>,
    private geocodingService: GeocodingService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreateFamilyProfileDto): Promise<FamilyProfile> {
    const existing = await this.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Profile already exists');
    }

    const user = await this.usersService.findOne(userId);

    let latitude = dto.latitude;
    let longitude = dto.longitude;
    
    if (!latitude && !longitude) {
      const geocoded = await this.geocodingService.geocode(dto.address);
      if (geocoded) {
        latitude = geocoded.latitude;
        longitude = geocoded.longitude;
      }
    }

    const profile = this.familyProfileRepository.create({
      user_id: userId,
      family_name: dto.family_name,
      address: dto.address,
      latitude,
      longitude,
      children_count: dto.children_count,
      children_ages: dto.children_ages || [],
      special_needs: dto.special_needs || [],
      languages_preferred: dto.languages_preferred || [],
    });

    const saved = await this.familyProfileRepository.save(profile);

    await this.usersService.update(userId, { profile_completed: true });

    return saved;
  }

  async findAll(): Promise<FamilyProfile[]> {
    return this.familyProfileRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<FamilyProfile> {
    const profile = await this.familyProfileRepository.findOne({
      where: { user_id: id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async findByUserId(userId: string): Promise<FamilyProfile | null> {
    return this.familyProfileRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
  }

  async update(userId: string, dto: UpdateFamilyProfileDto): Promise<FamilyProfile> {
    const profile = await this.findOne(userId);

    if (dto.address && dto.address !== profile.address) {
      if (dto.latitude && dto.longitude) {
        profile.latitude = dto.latitude;
        profile.longitude = dto.longitude;
      } else {
        const geocoded = await this.geocodingService.geocode(dto.address);
        if (geocoded) {
          profile.latitude = geocoded.latitude;
          profile.longitude = geocoded.longitude;
        }
      }
    }

    Object.assign(profile, dto);

    return this.familyProfileRepository.save(profile);
  }

  async remove(userId: string): Promise<void> {
    const profile = await this.findOne(userId);
    await this.familyProfileRepository.remove(profile);
  }
}
