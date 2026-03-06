import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Song } from '@/modules/songs/entities/song.entity';

@Entity('user_progress')
@Unique(['userId', 'songId'])
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  songId: string;

  @ManyToOne(() => Song, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'songId' })
  song: Song;

  @Column({ type: 'int', default: 0, comment: 'Index of last completed sentence' })
  lastCompletedSentenceIndex: number;

  @Column({ type: 'int', default: 0 })
  totalAttempts: number;

  @Column({ type: 'float', default: 0 })
  bestOverallScore: number;

  @Column({ type: 'float', default: 0 })
  averagePitchScore: number;

  @Column({ type: 'float', default: 0 })
  averageDurationScore: number;

  @Column({ type: 'float', default: 0 })
  averagePronunciationScore: number;

  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ type: 'int', default: 0, comment: 'XP earned from this song' })
  xpEarned: number;

  @Column({ type: 'jsonb', default: '[]', comment: 'Per-sentence best scores' })
  sentenceScores: {
    sentenceId: string;
    bestScore: number;
    attempts: number;
    pitchScore: number;
    durationScore: number;
    pronunciationScore: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
