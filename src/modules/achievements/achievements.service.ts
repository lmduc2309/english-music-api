import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementRepo: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private readonly userAchievementRepo: Repository<UserAchievement>,
  ) {}

  async getAllAchievements() {
    return this.achievementRepo.find();
  }

  async getUserAchievements(userId: string) {
    return this.userAchievementRepo.find({
      where: { userId },
      relations: ['achievement'],
      order: { unlockedAt: 'DESC' },
    });
  }

  async unlockAchievement(userId: string, achievementId: string) {
    const existing = await this.userAchievementRepo.findOne({
      where: { userId, achievementId },
    });
    if (existing) return null;

    const userAchievement = this.userAchievementRepo.create({
      userId,
      achievementId,
    });
    return this.userAchievementRepo.save(userAchievement);
  }
}
