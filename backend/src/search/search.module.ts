import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { CaregiverProfile } from '../caregiver-profiles/entities/caregiver-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CaregiverProfile])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
