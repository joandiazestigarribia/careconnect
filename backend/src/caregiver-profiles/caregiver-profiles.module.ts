import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaregiverProfilesService } from './caregiver-profiles.service';
import { CaregiverProfilesController } from './caregiver-profiles.controller';
import { CaregiverProfile } from './entities/caregiver-profile.entity';
import { GeocodingModule } from '../geocoding/geocoding.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CaregiverProfile]),
    GeocodingModule,
    UsersModule,
  ],
  controllers: [CaregiverProfilesController],
  providers: [CaregiverProfilesService],
  exports: [CaregiverProfilesService],
})
export class CaregiverProfilesModule {}
