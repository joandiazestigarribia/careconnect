import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CaregiverProfilesService } from './caregiver-profiles.service';
import { CreateCaregiverProfileDto } from './dto/create-caregiver-profile.dto';
import { UpdateCaregiverProfileDto } from './dto/update-caregiver-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Caregiver Profiles')
@Controller('caregiver-profiles')
export class CaregiverProfilesController {
  constructor(private readonly caregiverProfilesService: CaregiverProfilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCaregiverProfileDto,
  ) {
    return this.caregiverProfilesService.create(userId, dto);
  }

  @Get()
  @Public()
  findAll() {
    return this.caregiverProfilesService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMe(@CurrentUser('id') userId: string) {
    return this.caregiverProfilesService.findOne(userId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.caregiverProfilesService.findOne(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCaregiverProfileDto,
  ) {
    return this.caregiverProfilesService.update(userId, dto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@CurrentUser('id') userId: string) {
    return this.caregiverProfilesService.remove(userId);
  }
}
