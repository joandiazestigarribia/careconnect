import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { FamilyProfile } from '../../family-profiles/entities/family-profile.entity';
import { CaregiverProfile } from '../../caregiver-profiles/entities/caregiver-profile.entity';

export enum UserRole {
  FAMILY = 'FAMILY',
  CAREGIVER = 'CAREGIVER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.FAMILY,
  })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: false })
  profile_completed: boolean;

  @OneToOne(() => FamilyProfile, (profile) => profile.user)
  family_profile?: FamilyProfile;

  @OneToOne(() => CaregiverProfile, (profile) => profile.user)
  caregiver_profile?: CaregiverProfile;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
