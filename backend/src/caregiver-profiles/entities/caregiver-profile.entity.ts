import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export interface Point {
  type: 'Point';
  coordinates: [number, number];
}

@Entity('caregiver_profiles')
export class CaregiverProfile {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column('text', { nullable: true })
  bio: string;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: any;

  @Column('decimal', { precision: 10, scale: 2 })
  hourly_rate: number;

  @Column('simple-array')
  languages_spoken: string[];

  @Column('int')
  min_children_age: number;

  @Column('int')
  max_children_age: number;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column('int', { default: 5 })
  availability_radius_km: number;

  @Column({ nullable: true })
  response_time_avg: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  trust_score: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
