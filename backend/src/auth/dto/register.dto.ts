import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'Password123!', 
    minLength: 8, 
    maxLength: 100,
    description: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)' 
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)',
    }
  )
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.FAMILY })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: '+5491123456789', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
