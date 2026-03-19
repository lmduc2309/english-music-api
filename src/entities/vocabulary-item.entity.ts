import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User, CefrLevel } from './user.entity';

@Entity('vocabulary_items') @Unique(['userId', 'word'])
export class VocabularyItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @ManyToOne(() => User, (u) => u.vocabulary) @JoinColumn({ name: 'userId' }) user: User;
  @Column() word: string;
  @Column({ nullable: true }) definition: string;
  @Column({ nullable: true }) phonetic: string;
  @Column({ nullable: true }) exampleSentence: string;
  @Column({ nullable: true }) songContext: string;
  @Column({ nullable: true }) songId: string;
  @Column({ type: 'enum', enum: CefrLevel, nullable: true }) wordLevel: CefrLevel;
  @Column({ type: 'float', default: 2.5 }) easeFactor: number;
  @Column({ type: 'int', default: 0 }) interval: number;
  @Column({ type: 'int', default: 0 }) repetitions: number;
  @Column({ type: 'timestamp', nullable: true }) nextReviewDate: Date;
  @Column({ default: false }) mastered: boolean;
  @CreateDateColumn() createdAt: Date;
}
