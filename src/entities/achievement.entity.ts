import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) code: string;
  @Column() name: string;
  @Column() description: string;
  @Column({ nullable: true }) iconUrl: string;
  @Column() category: string;
  @Column({ type: 'int' }) threshold: number;
  @Column({ type: 'int', default: 0 }) xpReward: number;
}

@Entity('user_achievements')
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() achievementId: string;
  @ManyToOne(() => User, (u) => u.achievements) @JoinColumn({ name: 'userId' }) user: User;
  @ManyToOne(() => Achievement) @JoinColumn({ name: 'achievementId' }) achievement: Achievement;
  @CreateDateColumn() unlockedAt: Date;
}
