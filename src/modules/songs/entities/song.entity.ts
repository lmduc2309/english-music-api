import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CefrLevel } from '@/common/enums/cefr-level.enum';
import { Genre } from '@/common/enums/genre.enum';
import { SongSentence } from './song-sentence.entity';

@Entity('songs')
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  artist: string;

  @Column({ nullable: true })
  album: string;

  @Column({
    type: 'enum',
    enum: Genre,
    default: Genre.POP,
  })
  genre: Genre;

  @Column({
    type: 'enum',
    enum: CefrLevel,
  })
  cefrLevel: CefrLevel;

  @Column()
  videoUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'int', comment: 'Duration in seconds' })
  duration: number;

  @Column({ type: 'int', default: 0 })
  bpm: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  totalPlays: number;

  @Column({ type: 'float', default: 0 })
  averageScore: number;

  @Column({ type: 'int', default: 0 })
  totalSentences: number;

  @Column({ type: 'jsonb', nullable: true })
  vocabulary: {
    word: string;
    definition: string;
    phonetic: string;
    partOfSpeech: string;
  }[];

  @OneToMany(() => SongSentence, (sentence) => sentence.song, {
    cascade: true,
    eager: false,
  })
  sentences: SongSentence[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
