import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log({ email: createUserDto.email }, 'Creating new user');
    
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      this.logger.warn({ email: createUserDto.email }, 'User creation failed: email already registered');
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    this.logger.log({ userId: savedUser.id, email: savedUser.email }, 'User created successfully');
    
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    this.logger.debug('Fetching all users');
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    this.logger.debug({ userId: id }, 'Fetching user by ID');
    
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      this.logger.warn({ userId: id }, 'User not found');
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug({ email }, 'Fetching user by email');
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log({ userId: id }, 'Updating user');
    
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    
    const updatedUser = await this.usersRepository.save(user);
    this.logger.log({ userId: id }, 'User updated successfully');
    
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    this.logger.log({ userId: id }, 'Deleting user');
    
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    
    this.logger.log({ userId: id }, 'User deleted successfully');
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    this.logger.debug({ userId: user.id }, 'Validating user password');
    return bcrypt.compare(password, user.password);
  }
}
