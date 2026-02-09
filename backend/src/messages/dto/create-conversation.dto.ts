import { IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  caregiver_id: string;
}
