import { IsString, IsNumber, IsArray, IsOptional, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import * as xss from 'xss';

export class CreateFamilyProfileDto {
  @IsString()
  @Transform(({ value }) => xss.filterXSS(value))
  family_name: string;

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
  @Transform(({ value }) => value?.map((item: string) => xss.filterXSS(item)))
  special_needs?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => value?.map((item: string) => xss.filterXSS(item)))
  languages_preferred?: string[];
}
