import { IsNumber, IsOptional, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchFamiliesDto {
  @ApiProperty({ description: 'Latitude of the caregiver location' })
  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ description: 'Longitude of the caregiver location' })
  @IsNumber()
  @Type(() => Number)
  longitude: number;

  @ApiProperty({ description: 'Search radius in kilometers', required: false, default: 5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  radius_km?: number;

  @ApiProperty({ description: 'Preferred languages to filter families', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferred_languages?: string[];

  @ApiProperty({ description: 'Maximum number of children', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  max_children_count?: number;
}
