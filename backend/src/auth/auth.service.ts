import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { sanitizeSensitiveData } from '../common/interceptors/sensitive-data-sanitizer';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    profile_completed: boolean;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.log({ email: registerDto.email }, 'User registration attempt');
    
    try {
      const user = await this.usersService.create(registerDto);
      const token = this.generateToken(user);

      this.logger.log({ userId: user.id, email: user.email }, 'User registered successfully');

      return {
        token,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error(sanitizeSensitiveData({ email: registerDto.email, error: error.message }), 'User registration failed');
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    this.logger.log(sanitizeSensitiveData({ email: loginDto.email }), 'User login attempt');
    
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      this.logger.warn(sanitizeSensitiveData({ email: loginDto.email }), 'Login failed: user not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(sanitizeSensitiveData({ userId: user.id, email: user.email }), 'Login failed: invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);

    this.logger.log({ userId: user.id, email: user.email }, 'User logged in successfully');

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async getMe(userId: string): Promise<Partial<User>> {
    this.logger.debug({ userId }, 'Fetching current user profile');
    
    const user = await this.usersService.findOne(userId);
    return this.sanitizeUser(user);
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile_completed: user.profile_completed,
    };
  }
}
