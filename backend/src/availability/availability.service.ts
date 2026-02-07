import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability, DayOfWeek } from './entities/availability.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
  ) {}

  async create(caregiverId: string, dto: CreateAvailabilityDto): Promise<Availability> {
    this.validateTimeRange(dto.start_time, dto.end_time);

    const availability = this.availabilityRepository.create({
      caregiver_id: caregiverId,
      day_of_week: dto.day_of_week,
      start_time: dto.start_time,
      end_time: dto.end_time,
      is_recurring: dto.is_recurring ?? true,
      specific_date: dto.specific_date ? new Date(dto.specific_date) : null,
    });

    return this.availabilityRepository.save(availability);
  }

  async findAllByCaregiver(caregiverId: string): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { caregiver_id: caregiverId },
      order: {
        day_of_week: 'ASC',
        start_time: 'ASC',
      },
    });
  }

  async findWeeklySchedule(caregiverId: string): Promise<Record<DayOfWeek, Availability[]>> {
    const availabilities = await this.findAllByCaregiver(caregiverId);
    
    const schedule: Record<DayOfWeek, Availability[]> = {
      [DayOfWeek.MONDAY]: [],
      [DayOfWeek.TUESDAY]: [],
      [DayOfWeek.WEDNESDAY]: [],
      [DayOfWeek.THURSDAY]: [],
      [DayOfWeek.FRIDAY]: [],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: [],
    };

    availabilities.forEach(avail => {
      if (schedule[avail.day_of_week]) {
        schedule[avail.day_of_week].push(avail);
      }
    });

    return schedule;
  }

  async update(caregiverId: string, id: string, dto: UpdateAvailabilityDto): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, caregiver_id: caregiverId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (dto.start_time && dto.end_time) {
      this.validateTimeRange(dto.start_time, dto.end_time);
    }

    Object.assign(availability, {
      ...dto,
      specific_date: dto.specific_date ? new Date(dto.specific_date) : availability.specific_date,
    });

    return this.availabilityRepository.save(availability);
  }

  async remove(caregiverId: string, id: string): Promise<void> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, caregiver_id: caregiverId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    await this.availabilityRepository.remove(availability);
  }

  async removeAllByCaregiver(caregiverId: string): Promise<void> {
    await this.availabilityRepository.delete({ caregiver_id: caregiverId });
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start >= end) {
      throw new BadRequestException('end_time must be after start_time');
    }

    if (end - start < 30) {
      throw new BadRequestException('Availability slot must be at least 30 minutes');
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
