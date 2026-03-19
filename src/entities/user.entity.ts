import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PracticeSession } from './practice-session.entity';
import { UserProgress } from './user-progress.entity';
import { VocabularyItem } from './vocabulary-item.entity';
import { UserAchievement } from './achievement.entity';

export enum CefrLevel { A1='A1', A2='A2', B1='B1', B2='B2', C1='C1', C2='C2' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column() password: string;
  @Column() displayName: string;
  @Column({ nullable: true }) avatarUrl: string;
  @Column({ type: 'enum', enum: CefrLevel, default: CefrLevel.A1 }) currentLevel: CefrLevel;
  @Column({ default: 0 }) totalXp: number;
  @Column({ default: 0 }) currentStreak: number;
  @Column({ default: 0 }) longestStreak: number;
  @Column({ type: 'date', nullable: true }) lastPracticeDate: Date;
  @Column({ default: 'en' }) nativeLanguage: string;
  @OneToMany(() => PracticeSession, (s) => s.user) practiceSessions: PracticeSession[];
  @OneToMany(() => UserProgress, (p) => p.user) progress: UserProgress[];
  @OneToMany(() => VocabularyItem, (v) => v.user) vocabulary: VocabularyItem[];
  @OneToMany(() => UserAchievement, (ua: UserAchievement) => ua.user) achievements: UserAchievement[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
