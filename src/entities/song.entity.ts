import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CefrLevel } from './user.entity';
import { LyricLine } from './lyric-line.entity';
import { PracticeSession } from './practice-session.entity';

@Entity('songs')
export class Song {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column() artist: string;
  @Column() youtubeVideoId: string;
  @Column({ nullable: true }) thumbnailUrl: string;
  @Column({ type: 'enum', enum: CefrLevel }) level: CefrLevel;
  @Column({ nullable: true }) genre: string;
  @Column({ type: 'int', nullable: true }) bpm: number;
  @Column({ type: 'int', default: 0 }) durationSeconds: number;
  @Column({ type: 'int', default: 0 }) totalLines: number;
  @Column({ type: 'float', default: 0 }) averageRating: number;
  @Column({ type: 'int', default: 0 }) timesPlayed: number;
  @Column({ type: 'simple-array', nullable: true }) tags: string[];
  @Column({ default: true }) isActive: boolean;
  @OneToMany(() => LyricLine, (l) => l.song, { cascade: true }) lyrics: LyricLine[];
  @OneToMany(() => PracticeSession, (s) => s.song) practiceSessions: PracticeSession[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
