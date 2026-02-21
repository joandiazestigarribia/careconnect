import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMyAvailability(@CurrentUser('id') userId: string) {
    return this.availabilityService.findAllByCaregiver(userId);
  }

  @Get('schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyWeeklySchedule(@CurrentUser('id') userId: string) {
    return this.availabilityService.findWeeklySchedule(userId);
  }

  @Get('caregiver/:caregiverId')
  @Public()
  getByCaregiver(@Param('caregiverId') caregiverId: string) {
    return this.availabilityService.findAllByCaregiver(caregiverId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const availabilities = await this.availabilityService.findAllByCaregiver(userId);
    const availability = availabilities.find(a => a.id === id);
    if (!availability) {
      throw new NotFoundException('Availability not found');
    }
    return availability;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.update(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.availabilityService.remove(userId, id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  removeAll(@CurrentUser('id') userId: string) {
    return this.availabilityService.removeAllByCaregiver(userId);
  }
}
