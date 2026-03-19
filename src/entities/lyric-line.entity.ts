import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Song } from './song.entity';

@Entity('lyric_lines')
export class LyricLine {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() songId: string;
  @ManyToOne(() => Song, (s) => s.lyrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'songId' }) song: Song;
  @Column({ type: 'int' }) lineNumber: number;
  @Column({ type: 'text' }) text: string;
  @Column({ type: 'text', nullable: true }) phonetic: string;
  @Column({ type: 'float' }) startTime: number;
  @Column({ type: 'float' }) endTime: number;
  @Column({ type: 'simple-array', nullable: true }) keywords: string[];
  @Column({ type: 'jsonb', nullable: true }) wordTimestamps: { word: string; start: number; end: number }[];
}
