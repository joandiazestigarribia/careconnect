import { PartialType } from '@nestjs/swagger';
import { CreateCaregiverProfileDto } from './create-caregiver-profile.dto';

export class UpdateCaregiverProfileDto extends PartialType(CreateCaregiverProfileDto) {}
