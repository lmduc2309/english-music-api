import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PracticeSession } from './practice-session.entity';
import { LyricLine } from './lyric-line.entity';

@Entity('sentence_attempts')
export class SentenceAttempt {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() sessionId: string;
  @Column() lyricLineId: string;
  @ManyToOne(() => PracticeSession, (s) => s.attempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' }) session: PracticeSession;
  @ManyToOne(() => LyricLine) @JoinColumn({ name: 'lyricLineId' }) lyricLine: LyricLine;
  @Column({ type: 'int' }) attemptNumber: number;
  @Column({ type: 'text', nullable: true }) transcribedText: string;
  @Column({ type: 'float', default: 0 }) pitchScore: number;
  @Column({ type: 'float', default: 0 }) pronunciationScore: number;
  @Column({ type: 'float', default: 0 }) timingScore: number;
  @Column({ type: 'float', default: 0 }) wordAccuracyScore: number;
  @Column({ type: 'float', default: 0 }) totalScore: number;
  @Column({ default: false }) passed: boolean;
  @Column({ type: 'jsonb', nullable: true }) wordDetails: { word: string; expected: string; correct: boolean; pronunciationNote: string }[];
  @Column({ type: 'text', nullable: true }) aiFeedback: string;
  @Column({ type: 'jsonb', nullable: true }) pitchData: { time: number; frequency: number }[];
  @CreateDateColumn() createdAt: Date;
}
