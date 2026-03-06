import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Song } from './song.entity';

@Entity('song_sentences')
export class SongSentence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  songId: string;

  @ManyToOne(() => Song, (song) => song.sentences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'songId' })
  song: Song;

  @Column({ type: 'int' })
  orderIndex: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'text', nullable: true, comment: 'IPA phonetic transcription' })
  phonetic: string;

  @Column({ type: 'float', comment: 'Start time in seconds' })
  startTime: number;

  @Column({ type: 'float', comment: 'End time in seconds' })
  endTime: number;

  @Column({ type: 'float', comment: 'Expected duration in seconds' })
  expectedDuration: number;

  @Column({ type: 'jsonb', nullable: true, comment: 'Expected pitch contour data points' })
  pitchContour: { time: number; frequency: number }[];

  @Column({ type: 'simple-array', nullable: true, comment: 'Key vocabulary words in this line' })
  keyWords: string[];

  @Column({ type: 'text', nullable: true, comment: 'Grammar or usage notes' })
  teachingNote: string;

  @Column({ type: 'int', default: 1, comment: 'Difficulty 1-10 within the CEFR level' })
  difficulty: number;

  @CreateDateColumn()
  createdAt: Date;
}
