import { Controller, Post, Body, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { SearchService, type SearchResult, type FamilySearchResult } from './search.service';
import { SearchCaregiversDto } from './dto/search-caregivers.dto';
import { SearchFamiliesDto } from './dto/search-families.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Throttle({ search: { limit: 30, ttl: 60000 } })
  @Post('caregivers')
  searchCaregivers(@Body() dto: SearchCaregiversDto): Promise<SearchResult[]> {
    return this.searchService.searchCaregivers(dto);
  }

  @Public()
  @Throttle({ search: { limit: 30, ttl: 60000 } })
  @Post('families')
  searchFamilies(@Body() dto: SearchFamiliesDto): Promise<FamilySearchResult[]> {
    return this.searchService.searchFamilies(dto);
  }
}
