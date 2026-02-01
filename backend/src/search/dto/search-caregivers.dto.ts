import { IsNumber, IsString, IsOptional, IsArray, Min, Max } from 'class-validator';

export class SearchCaregiversDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  radius_km?: number = 5;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferred_languages?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  required_skills?: string[];

  @IsNumber()
  @Min(0)
  @Max(18)
  @IsOptional()
  child_age?: number;

  @IsNumber()
  @IsOptional()
  max_hourly_rate?: number;
}
