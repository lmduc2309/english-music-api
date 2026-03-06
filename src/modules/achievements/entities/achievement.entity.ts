import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { AchievementType } from '@/common/enums/achievement-type.enum';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AchievementType, unique: true })
  type: AchievementType;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  iconUrl: string;

  @Column({ type: 'int', default: 0, comment: 'XP bonus for unlocking' })
  xpReward: number;

  @CreateDateColumn()
  createdAt: Date;
}
