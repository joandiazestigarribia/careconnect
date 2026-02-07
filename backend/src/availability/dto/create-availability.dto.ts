import { IsEnum, IsString, IsBoolean, IsOptional, IsDateString, Matches } from 'class-validator';
import { DayOfWeek } from '../entities/availability.entity';

export class CreateAvailabilityDto {
  @IsEnum(DayOfWeek)
  day_of_week: DayOfWeek;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'start_time must be in HH:MM format',
  })
  start_time: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'end_time must be in HH:MM format',
  })
  end_time: string;

  @IsBoolean()
  @IsOptional()
  is_recurring?: boolean;

  @IsDateString()
  @IsOptional()
  specific_date?: string;
}
