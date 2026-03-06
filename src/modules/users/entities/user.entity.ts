import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CefrLevel } from '@/common/enums/cefr-level.enum';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({
    type: 'enum',
    enum: CefrLevel,
    default: CefrLevel.A1,
  })
  currentLevel: CefrLevel;

  @Column({ default: 0 })
  totalXp: number;

  @Column({ default: 0 })
  currentStreak: number;

  @Column({ default: 0 })
  longestStreak: number;

  @Column({ type: 'date', nullable: true })
  lastPracticeDate: Date;

  @Column({ default: 0 })
  songsCompleted: number;

  @Column({ type: 'jsonb', default: '{}' })
  preferences: {
    nativeLanguage?: string;
    dailyGoalMinutes?: number;
    preferredGenres?: string[];
    notificationsEnabled?: boolean;
  };

  @Column({ nullable: true })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
