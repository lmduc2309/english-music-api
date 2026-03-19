import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Song } from './song.entity';
import { SentenceAttempt } from './sentence-attempt.entity';

export enum SessionStatus { IN_PROGRESS='in_progress', COMPLETED='completed', ABANDONED='abandoned' }

@Entity('practice_sessions')
export class PracticeSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() songId: string;
  @ManyToOne(() => User, (u) => u.practiceSessions) @JoinColumn({ name: 'userId' }) user: User;
  @ManyToOne(() => Song, (s) => s.practiceSessions) @JoinColumn({ name: 'songId' }) song: Song;
  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.IN_PROGRESS }) status: SessionStatus;
  @Column({ type: 'int', default: 0 }) currentLineIndex: number;
  @Column({ type: 'int', default: 0 }) totalLinesCompleted: number;
  @Column({ type: 'float', default: 0 }) overallScore: number;
  @Column({ type: 'float', default: 0 }) pitchScore: number;
  @Column({ type: 'float', default: 0 }) pronunciationScore: number;
  @Column({ type: 'float', default: 0 }) timingScore: number;
  @Column({ type: 'float', default: 0 }) wordAccuracyScore: number;
  @Column({ type: 'int', default: 0 }) xpEarned: number;
  @Column({ type: 'int', default: 0 }) totalAttempts: number;
  @OneToMany(() => SentenceAttempt, (a) => a.session, { cascade: true }) attempts: SentenceAttempt[];
  @CreateDateColumn() startedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) completedAt: Date;
}
