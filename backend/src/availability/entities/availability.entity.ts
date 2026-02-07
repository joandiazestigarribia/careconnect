import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CaregiverProfile } from '../../caregiver-profiles/entities/caregiver-profile.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('availabilities')
@Index(['caregiver_id', 'day_of_week'])
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'caregiver_id' })
  caregiver_id: string;

  @ManyToOne(() => CaregiverProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caregiver_id' })
  caregiver: CaregiverProfile;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
    name: 'day_of_week',
  })
  day_of_week: DayOfWeek;

  @Column({ type: 'time', name: 'start_time' })
  start_time: string;

  @Column({ type: 'time', name: 'end_time' })
  end_time: string;

  @Column({ type: 'boolean', default: true })
  is_recurring: boolean;

  @Column({ type: 'date', nullable: true, name: 'specific_date' })
  specific_date: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
