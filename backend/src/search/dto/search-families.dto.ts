import { IsNumber, IsOptional, IsArray, IsString, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchFamiliesDto {
  @ApiProperty({ description: 'Latitude of the caregiver location' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ description: 'Longitude of the caregiver location' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;

  @ApiProperty({ description: 'Search radius in kilometers', required: false, default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  radius_km?: number = 5;

  @ApiProperty({ description: 'Preferred languages to filter families', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.filter(v => typeof v === 'string' && v.length <= 50);
    return value;
  })
  preferred_languages?: string[];

  @ApiProperty({ description: 'Maximum number of children', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  max_children_count?: number;
}
