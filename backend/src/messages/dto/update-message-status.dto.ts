import { IsEnum } from 'class-validator';
import { MessageStatus } from '../entities/message.entity';

export class UpdateMessageStatusDto {
  @IsEnum(MessageStatus)
  status: MessageStatus;
}
