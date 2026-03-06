import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ScoreRecord } from '../scoring/entities/score-record.entity';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ScoreRecord)
    private readonly scoreRepository: Repository<ScoreRecord>,
  ) {}

  async getGlobalLeaderboard(limit = 50) {
    return this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.avatarUrl',
        'user.totalXp',
        'user.currentLevel',
        'user.songsCompleted',
        'user.currentStreak',
      ])
      .orderBy('user.totalXp', 'DESC')
      .take(limit)
      .getMany();
  }

  async getWeeklyLeaderboard(limit = 50) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const results = await this.scoreRepository
      .createQueryBuilder('score')
      .select('score.userId', 'userId')
      .addSelect('SUM(score.totalScore)', 'weeklyScore')
      .addSelect('COUNT(*)', 'attempts')
      .where('score.createdAt >= :date', { date: oneWeekAgo })
      .groupBy('score.userId')
      .orderBy('"weeklyScore"', 'DESC')
      .limit(limit)
      .getRawMany();

    // Enrich with user data
    const userIds = results.map((r) => r.userId);
    if (!userIds.length) return [];

    const users = await this.userRepository
      .createQueryBuilder('user')
      .whereInIds(userIds)
      .getMany();

    const userMap = new Map(users.map((u) => [u.id, u]));
    return results.map((r, idx) => ({
      rank: idx + 1,
      userId: r.userId,
      username: userMap.get(r.userId)?.username || 'Unknown',
      avatarUrl: userMap.get(r.userId)?.avatarUrl,
      weeklyScore: parseFloat(r.weeklyScore),
      attempts: parseInt(r.attempts),
    }));
  }

  async getSongLeaderboard(songId: string, limit = 20) {
    const results = await this.scoreRepository
      .createQueryBuilder('score')
      .select('score.userId', 'userId')
      .addSelect('MAX(score.totalScore)', 'bestScore')
      .where('score.songId = :songId', { songId })
      .andWhere('score.passed = :passed', { passed: true })
      .groupBy('score.userId')
      .orderBy('"bestScore"', 'DESC')
      .limit(limit)
      .getRawMany();

    const userIds = results.map((r) => r.userId);
    if (!userIds.length) return [];

    const users = await this.userRepository
      .createQueryBuilder('user')
      .whereInIds(userIds)
      .getMany();

    const userMap = new Map(users.map((u) => [u.id, u]));
    return results.map((r, idx) => ({
      rank: idx + 1,
      userId: r.userId,
      username: userMap.get(r.userId)?.username || 'Unknown',
      avatarUrl: userMap.get(r.userId)?.avatarUrl,
      bestScore: parseFloat(r.bestScore),
    }));
  }
}
