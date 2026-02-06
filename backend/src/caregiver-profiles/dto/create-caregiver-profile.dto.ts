import { IsString, IsNumber, IsArray, IsOptional, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import * as xss from 'xss';

export class CreateCaregiverProfileDto {
  @IsString()
  @Transform(({ value }) => xss.filterXSS(value))
  first_name: string;

  @IsString()
  @Transform(({ value }) => xss.filterXSS(value))
  last_name: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => xss.filterXSS(value))
  bio?: string;

  @IsString()
  @Transform(({ value }) => xss.filterXSS(value))
  address: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @Min(0)
  hourly_rate: number;

  @IsArray()
  @IsString({ each: true })
  languages_spoken: string[];

  @IsNumber()
  @Min(0)
  @Max(18)
  min_children_age: number;

  @IsNumber()
  @Min(0)
  @Max(18)
  max_children_age: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  availability_radius_km?: number;
}
