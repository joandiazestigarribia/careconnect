import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CaregiverProfilesService } from './caregiver-profiles.service';
import { CaregiverProfile } from './entities/caregiver-profile.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { GeocodingService } from '../geocoding/geocoding.service';

describe('CaregiverProfilesService', () => {
  let service: CaregiverProfilesService;
  let repository: jest.Mocked<Repository<CaregiverProfile>>;
  let usersService: jest.Mocked<UsersService>;
  let geocodingService: jest.Mocked<GeocodingService>;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'caregiver@test.com',
    password: 'hashed',
    role: UserRole.CAREGIVER,
    phone: null,
    verified: false,
    profile_completed: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockProfile: CaregiverProfile = {
    user_id: mockUser.id,
    user: mockUser,
    first_name: 'John',
    last_name: 'Doe',
    bio: 'Experienced caregiver',
    address: 'Av. Corrientes 1234, Buenos Aires',
    location: null,
    hourly_rate: 25.5,
    languages_spoken: ['Spanish', 'English'],
    min_children_age: 0,
    max_children_age: 12,
    skills: ['First Aid', 'Cooking'],
    availability_radius_km: 10,
    response_time_avg: null,
    trust_score: 4.5,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockGeocodingService = {
    createPoint: jest.fn().mockReturnValue({ type: 'Point', coordinates: [-58.38, -34.60] }),
    geocode: jest.fn().mockResolvedValue({ latitude: -34.60, longitude: -58.38, display_name: 'Test Address' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaregiverProfilesService,
        {
          provide: getRepositoryToken(CaregiverProfile),
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: GeocodingService,
          useValue: mockGeocodingService,
        },
      ],
    }).compile();

    service = module.get<CaregiverProfilesService>(CaregiverProfilesService);
    repository = module.get(getRepositoryToken(CaregiverProfile));
    usersService = module.get(UsersService);
    geocodingService = module.get(GeocodingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of caregiver profiles', async () => {
      const profiles = [mockProfile];
      repository.find.mockResolvedValue(profiles);

      const result = await service.findAll();

      expect(result).toEqual(profiles);
      expect(repository.find).toHaveBeenCalledWith({ relations: ['user'] });
    });
  });

  describe('findOne', () => {
    it('should return a caregiver profile by user_id', async () => {
      repository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockProfile);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { user_id: mockUser.id },
        relations: ['user'],
      });
    });

    it('should throw NotFoundException if profile not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return a caregiver profile by user id', async () => {
      repository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findByUserId(mockUser.id);

      expect(result).toEqual(mockProfile);
    });

    it('should return null if profile not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByUserId('non-existent-user');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createDto = {
      first_name: 'Jane',
      last_name: 'Smith',
      bio: 'New caregiver bio',
      address: 'Av. Santa Fe 5678, Buenos Aires',
      hourly_rate: 30.0,
      languages_spoken: ['Spanish'],
      min_children_age: 0,
      max_children_age: 10,
      skills: ['Child Care'],
      availability_radius_km: 5,
    };

    it('should create a new caregiver profile', async () => {
      const userId = 'new-user-id';
      const newProfile = { ...mockProfile, user_id: userId, ...createDto };
      
      repository.findOne.mockResolvedValue(null);
      mockUsersService.findOne.mockResolvedValue(mockUser);
      repository.create.mockReturnValue(newProfile);
      repository.save.mockResolvedValue(newProfile);

      const result = await service.create(userId, createDto);

      expect(result).toEqual(newProfile);
      expect(repository.save).toHaveBeenCalled();
      expect(mockUsersService.update).toHaveBeenCalledWith(userId, { profile_completed: true });
    });

    it('should throw ConflictException if profile already exists', async () => {
      repository.findOne.mockResolvedValue(mockProfile);

      await expect(service.create(mockUser.id, createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      bio: 'Updated bio',
      hourly_rate: 35.0,
    };

    it('should update profile successfully', async () => {
      const updatedProfile = { ...mockProfile, ...updateDto };
      repository.findOne.mockResolvedValue(mockProfile);
      repository.save.mockResolvedValue(updatedProfile);

      const result = await service.update(mockUser.id, updateDto);

      expect(result).toEqual(updatedProfile);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if profile not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove profile successfully', async () => {
      repository.findOne.mockResolvedValue(mockProfile);
      repository.remove.mockResolvedValue(mockProfile);

      await service.remove(mockUser.id);

      expect(repository.remove).toHaveBeenCalledWith(mockProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
