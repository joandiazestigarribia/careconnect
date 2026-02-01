import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeocodingService } from './geocoding.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Geocoding')
@Controller('geocode')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Geocode an address to coordinates' })
  @ApiResponse({
    status: 200,
    description: 'Returns latitude and longitude for the given address',
  })
  async geocode(@Query('address') address: string) {
    if (!address) {
      return {
        success: false,
        error: 'Address parameter is required',
      };
    }

    const result = await this.geocodingService.geocode(address);

    if (!result) {
      return null;
    }

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      display_name: result.display_name,
    };
  }
}
