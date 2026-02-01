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
import { FamilyProfilesService } from './family-profiles.service';
import { CreateFamilyProfileDto } from './dto/create-family-profile.dto';
import { UpdateFamilyProfileDto } from './dto/update-family-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Family Profiles')
@Controller('family-profiles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FamilyProfilesController {
  constructor(private readonly familyProfilesService: FamilyProfilesService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFamilyProfileDto,
  ) {
    return this.familyProfilesService.create(userId, dto);
  }

  @Get()
  findAll() {
    return this.familyProfilesService.findAll();
  }

  @Get('me')
  findMe(@CurrentUser('id') userId: string) {
    return this.familyProfilesService.findOne(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.familyProfilesService.findOne(id);
  }

  @Patch('me')
  update(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateFamilyProfileDto,
  ) {
    return this.familyProfilesService.update(userId, dto);
  }

  @Delete('me')
  remove(@CurrentUser('id') userId: string) {
    return this.familyProfilesService.remove(userId);
  }
}
