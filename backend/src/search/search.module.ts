import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { CaregiverProfile } from '../caregiver-profiles/entities/caregiver-profile.entity';
import { FamilyProfile } from '../family-profiles/entities/family-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CaregiverProfile, FamilyProfile])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
