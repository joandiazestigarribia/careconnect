import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchService, SearchResult } from './search.service';
import { CaregiverProfile } from '../caregiver-profiles/entities/caregiver-profile.entity';
import { SearchCaregiversDto } from './dto/search-caregivers.dto';

describe('SearchService', () => {
  let service: SearchService;
  let caregiverRepo: jest.Mocked<Repository<CaregiverProfile>>;

  const mockCaregivers: CaregiverProfile[] = [
    {
      user_id: '1',
      first_name: 'John',
      last_name: 'Doe',
      bio: 'Experienced caregiver',
      location: null,
      hourly_rate: 25,
      languages_spoken: ['Spanish', 'English'],
      min_children_age: 0,
      max_children_age: 12,
      skills: ['Elderly Care'],
      availability_radius_km: 10,
      trust_score: 4.5,
      response_time_avg: null,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as CaregiverProfile,
    {
      user_id: '2',
      first_name: 'Jane',
      last_name: 'Smith',
      bio: 'New caregiver',
      location: null,
      hourly_rate: 20,
      languages_spoken: ['Spanish'],
      min_children_age: 0,
      max_children_age: 5,
      skills: ['Child Care'],
      availability_radius_km: 5,
      trust_score: 3.5,
      response_time_avg: null,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as CaregiverProfile,
  ];

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(mockCaregivers),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(CaregiverProfile),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    caregiverRepo = module.get(getRepositoryToken(CaregiverProfile));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchCaregivers', () => {
    const searchDto: SearchCaregiversDto = {
      latitude: -34.6037,
      longitude: -58.3816,
      radius_km: 10,
    };

    it('should search caregivers by location', async () => {
      const results = await service.searchCaregivers(searchDto);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(caregiverRepo.createQueryBuilder).toHaveBeenCalled();
    });

    it('should apply max_hourly_rate filter when provided', async () => {
      const dtoWithRate: SearchCaregiversDto = {
        ...searchDto,
        max_hourly_rate: 30,
      };

      await service.searchCaregivers(dtoWithRate);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'caregiver.hourly_rate <= :max_rate',
        { max_rate: 30 },
      );
    });

    it('should use default radius of 5km when not specified', async () => {
      const dtoWithoutRadius: SearchCaregiversDto = {
        latitude: -34.6037,
        longitude: -58.3816,
      };

      await service.searchCaregivers(dtoWithoutRadius);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('ST_DWithin'),
        expect.objectContaining({
          latitude: -34.6037,
          longitude: -58.3816,
          radius: 5000,
        }),
      );
    });

    it('should return results with correct structure', async () => {
      const results = await service.searchCaregivers(searchDto);

      expect(results).toBeDefined();
      results.forEach((result: SearchResult) => {
        expect(result).toHaveProperty('caregiver');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('distance_km');
        expect(typeof result.score).toBe('number');
        expect(typeof result.distance_km).toBe('number');
      });
    });
  });
});
