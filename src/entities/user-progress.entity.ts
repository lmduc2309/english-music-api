import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Song } from './song.entity';

@Entity('user_progress') @Unique(['userId', 'songId'])
export class UserProgress {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() songId: string;
  @ManyToOne(() => User, (u) => u.progress) @JoinColumn({ name: 'userId' }) user: User;
  @ManyToOne(() => Song) @JoinColumn({ name: 'songId' }) song: Song;
  @Column({ type: 'int', default: 0 }) completedLines: number;
  @Column({ type: 'int', default: 0 }) totalLines: number;
  @Column({ type: 'float', default: 0 }) bestScore: number;
  @Column({ type: 'float', default: 0 }) averageScore: number;
  @Column({ type: 'int', default: 0 }) totalAttempts: number;
  @Column({ default: false }) isCompleted: boolean;
  @Column({ type: 'int', default: 0 }) stars: number;
  @Column({ type: 'timestamp', nullable: true }) lastPlayedAt: Date;
}
