import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaregiverProfile } from './entities/caregiver-profile.entity';
import { CreateCaregiverProfileDto } from './dto/create-caregiver-profile.dto';
import { UpdateCaregiverProfileDto } from './dto/update-caregiver-profile.dto';
import { GeocodingService } from '../geocoding/geocoding.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CaregiverProfilesService {
  constructor(
    @InjectRepository(CaregiverProfile)
    private caregiverProfileRepository: Repository<CaregiverProfile>,
    private geocodingService: GeocodingService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreateCaregiverProfileDto): Promise<CaregiverProfile> {
    const existing = await this.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Profile already exists');
    }

    const user = await this.usersService.findOne(userId);

    let location: any = null;
    if (dto.latitude && dto.longitude) {
      location = this.geocodingService.createPoint(dto.longitude, dto.latitude);
    }

    const profile = this.caregiverProfileRepository.create({
      user_id: userId,
      first_name: dto.first_name,
      last_name: dto.last_name,
      bio: dto.bio,
      location,
      hourly_rate: dto.hourly_rate,
      languages_spoken: dto.languages_spoken,
      min_children_age: dto.min_children_age,
      max_children_age: dto.max_children_age,
      skills: dto.skills || [],
      availability_radius_km: dto.availability_radius_km || 5,
    });

    const saved = await this.caregiverProfileRepository.save(profile);

    await this.usersService.update(userId, { profile_completed: true });

    return saved;
  }

  async findAll(): Promise<CaregiverProfile[]> {
    return this.caregiverProfileRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<CaregiverProfile> {
    const profile = await this.caregiverProfileRepository.findOne({
      where: { user_id: id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async findByUserId(userId: string): Promise<CaregiverProfile | null> {
    return this.caregiverProfileRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
  }

  async update(userId: string, dto: UpdateCaregiverProfileDto): Promise<CaregiverProfile> {
    const profile = await this.findOne(userId);

    if (dto.latitude && dto.longitude) {
      profile.location = this.geocodingService.createPoint(dto.longitude, dto.latitude);
    }

    Object.assign(profile, dto);

    return this.caregiverProfileRepository.save(profile);
  }

  async remove(userId: string): Promise<void> {
    const profile = await this.findOne(userId);
    await this.caregiverProfileRepository.remove(profile);
  }
}
