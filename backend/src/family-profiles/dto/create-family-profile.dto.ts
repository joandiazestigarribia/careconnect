import { IsString, IsNumber, IsArray, IsOptional, Min, Max } from 'class-validator';

export class CreateFamilyProfileDto {
  @IsString()
  family_name: string;

  @IsString()
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
  @Min(1)
  @Max(10)
  children_count: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  children_ages?: number[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  special_needs?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages_preferred?: string[];
}
