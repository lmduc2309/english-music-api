import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Song } from '@/modules/songs/entities/song.entity';
import { SongSentence } from '@/modules/songs/entities/song-sentence.entity';

@Entity('score_records')
export class ScoreRecord {
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

  @Column()
  sentenceId: string;

  @ManyToOne(() => SongSentence, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sentenceId' })
  sentence: SongSentence;

  @Column({ type: 'float' })
  pitchScore: number;

  @Column({ type: 'float' })
  durationScore: number;

  @Column({ type: 'float' })
  pronunciationScore: number;

  @Column({ type: 'float' })
  totalScore: number;

  @Column({ type: 'boolean' })
  passed: boolean;

  @Column({ type: 'text', comment: 'What the user actually said (STT result)' })
  recognizedText: string;

  @Column({ type: 'jsonb', nullable: true, comment: 'Per-word accuracy breakdown' })
  wordAnalysis: {
    word: string;
    expected: string;
    isCorrect: boolean;
    confidence: number;
    phonemeAccuracy?: number;
  }[];

  @Column({ type: 'jsonb', nullable: true, comment: 'Pitch data from user recording' })
  userPitchData: { time: number; frequency: number }[];

  @Column({ type: 'float', nullable: true })
  userDuration: number;

  @Column({ type: 'text', nullable: true, comment: 'Feedback message for the user' })
  feedback: string;

  @CreateDateColumn()
  createdAt: Date;
}
