import { IsNumber, IsString, IsOptional, IsArray, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class SearchCaregiversDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  radius_km?: number = 5;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.filter(v => typeof v === 'string' && v.length <= 50);
    return value;
  })
  preferred_languages?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.filter(v => typeof v === 'string' && v.length <= 50);
    return value;
  })
  required_skills?: string[];

  @IsNumber()
  @Min(0)
  @Max(18)
  @IsOptional()
  @Type(() => Number)
  child_age?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  max_hourly_rate?: number;
}
