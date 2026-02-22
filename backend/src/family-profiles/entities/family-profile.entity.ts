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

@Entity('family_profiles')
export class FamilyProfile {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  family_name: string;

  @Column()
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true, transformer: {
    from: (v: string | number | null) => v === null ? null : Number(v),
    to: (v: string | number | null) => v === null ? null : Number(v),
  }})
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true, transformer: {
    from: (v: string | number | null) => v === null ? null : Number(v),
    to: (v: string | number | null) => v === null ? null : Number(v),
  }})
  longitude: number;

  @Column('int', { default: 1 })
  children_count: number;

  @Column('simple-array', { nullable: true })
  children_ages: number[];

  @Column('simple-array', { nullable: true })
  special_needs: string[];

  @Column('simple-array', { nullable: true })
  languages_preferred: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
