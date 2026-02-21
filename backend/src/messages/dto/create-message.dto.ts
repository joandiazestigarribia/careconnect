import { IsUUID, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMessageDto {
  @IsUUID()
  conversation_id: string;

  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/\s+/g, ' ');
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  @Matches(/^[^<>]*$/, {
    message: 'Message contains invalid characters',
  })
  content: string;
}
