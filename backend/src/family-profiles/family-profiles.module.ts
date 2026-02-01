import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyProfilesService } from './family-profiles.service';
import { FamilyProfilesController } from './family-profiles.controller';
import { FamilyProfile } from './entities/family-profile.entity';
import { GeocodingModule } from '../geocoding/geocoding.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FamilyProfile]),
    GeocodingModule,
    UsersModule,
  ],
  controllers: [FamilyProfilesController],
  providers: [FamilyProfilesService],
  exports: [FamilyProfilesService],
})
export class FamilyProfilesModule {}
