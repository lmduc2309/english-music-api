import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement, UserAchievement, User } from '../entities';

const DEFAULT_ACHIEVEMENTS = [
  { code: 'streak_3', name: 'Getting Started', description: 'Practice 3 days in a row', category: 'streak', threshold: 3, xpReward: 50 },
  { code: 'streak_7', name: 'Week Warrior', description: 'Practice 7 days in a row', category: 'streak', threshold: 7, xpReward: 100 },
  { code: 'streak_30', name: 'Monthly Master', description: 'Practice 30 days in a row', category: 'streak', threshold: 30, xpReward: 500 },
  { code: 'streak_100', name: 'Unstoppable', description: '100-day practice streak', category: 'streak', threshold: 100, xpReward: 2000 },
  { code: 'songs_1', name: 'First Song', description: 'Complete your first song', category: 'songs', threshold: 1, xpReward: 30 },
  { code: 'songs_5', name: 'Playlist Pro', description: 'Complete 5 songs', category: 'songs', threshold: 5, xpReward: 100 },
  { code: 'songs_25', name: 'Karaoke King', description: 'Complete 25 songs', category: 'songs', threshold: 25, xpReward: 500 },
  { code: 'songs_100', name: 'Concert Ready', description: 'Complete 100 songs', category: 'songs', threshold: 100, xpReward: 2000 },
  { code: 'perfect_line', name: 'Perfect Note', description: 'Score 100% on a sentence', category: 'score', threshold: 100, xpReward: 50 },
  { code: 'perfect_song', name: 'Flawless', description: 'Complete a song with 95%+ average', category: 'score', threshold: 95, xpReward: 200 },
  { code: 'vocab_50', name: 'Word Collector', description: 'Learn 50 new words', category: 'vocabulary', threshold: 50, xpReward: 100 },
  { code: 'vocab_200', name: 'Dictionary', description: 'Learn 200 new words', category: 'vocabulary', threshold: 200, xpReward: 500 },
  { code: 'xp_1000', name: 'Rising Star', description: 'Earn 1,000 XP', category: 'xp', threshold: 1000, xpReward: 100 },
  { code: 'xp_10000', name: 'Superstar', description: 'Earn 10,000 XP', category: 'xp', threshold: 10000, xpReward: 500 },
];

@Injectable()
export class GamificationService implements OnModuleInit {
  constructor(
    @InjectRepository(Achievement) private achievementRepo: Repository<Achievement>,
    @InjectRepository(UserAchievement) private userAchievementRepo: Repository<UserAchievement>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    for (const a of DEFAULT_ACHIEVEMENTS) {
      const exists = await this.achievementRepo.findOne({ where: { code: a.code } });
      if (!exists) await this.achievementRepo.save(this.achievementRepo.create(a));
    }
  }

  async checkAndAwardAchievements(userId: string, context: { currentStreak?: number; songsCompleted?: number; sentenceScore?: number; songAverageScore?: number; vocabularyCount?: number; totalXp?: number }): Promise<UserAchievement[]> {
    const awarded: UserAchievement[] = [];
    const allAchievements = await this.achievementRepo.find();
    const existing = await this.userAchievementRepo.find({ where: { userId }, relations: ['achievement'] });
    const existingCodes = new Set(existing.map(ua => ua.achievement.code));

    for (const achievement of allAchievements) {
      if (existingCodes.has(achievement.code)) continue;
      let earned = false;
      switch (achievement.category) {
        case 'streak': earned = (context.currentStreak || 0) >= achievement.threshold; break;
        case 'songs': earned = (context.songsCompleted || 0) >= achievement.threshold; break;
        case 'score':
          if (achievement.code === 'perfect_line') earned = (context.sentenceScore || 0) >= achievement.threshold;
          if (achievement.code === 'perfect_song') earned = (context.songAverageScore || 0) >= achievement.threshold;
          break;
        case 'vocabulary': earned = (context.vocabularyCount || 0) >= achievement.threshold; break;
        case 'xp': earned = (context.totalXp || 0) >= achievement.threshold; break;
      }
      if (earned) {
        const ua = this.userAchievementRepo.create({ userId, achievementId: achievement.id });
        const saved = await this.userAchievementRepo.save(ua);
        saved.achievement = achievement;
        awarded.push(saved);
        if (achievement.xpReward > 0) await this.userRepo.increment({ id: userId }, 'totalXp', achievement.xpReward);
      }
    }
    return awarded;
  }

  async getUserAchievements(userId: string) {
    const all = await this.achievementRepo.find({ order: { category: 'ASC', threshold: 'ASC' } });
    const unlocked = await this.userAchievementRepo.find({ where: { userId }, relations: ['achievement'] });
    const unlockedMap = new Map(unlocked.map(ua => [ua.achievement.code, ua.unlockedAt]));
    return all.map(a => ({ ...a, unlocked: unlockedMap.has(a.code), unlockedAt: unlockedMap.get(a.code) || null }));
  }

  async getUserStats(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const achievementCount = await this.userAchievementRepo.count({ where: { userId } });
    const totalAchievements = await this.achievementRepo.count();
    return { totalXp: user?.totalXp || 0, currentStreak: user?.currentStreak || 0, longestStreak: user?.longestStreak || 0, currentLevel: user?.currentLevel || 'A1', achievementsUnlocked: achievementCount, totalAchievements, level: this.xpToLevel(user?.totalXp || 0) };
  }

  private xpToLevel(xp: number) {
    const levels = [
      { xp: 0, title: 'Beginner Listener' }, { xp: 100, title: 'Shy Singer' },
      { xp: 300, title: 'Bathroom Vocalist' }, { xp: 600, title: 'Karaoke Rookie' },
      { xp: 1000, title: 'Melody Maker' }, { xp: 2000, title: 'Rhythm Rider' },
      { xp: 3500, title: 'Verse Virtuoso' }, { xp: 5000, title: 'Chorus Champion' },
      { xp: 8000, title: 'Harmony Hero' }, { xp: 12000, title: 'Stage Star' },
      { xp: 20000, title: 'Master Singer' },
    ];
    let currentLevel = 0;
    for (let i = levels.length - 1; i >= 0; i--) { if (xp >= levels[i].xp) { currentLevel = i; break; } }
    const current = levels[currentLevel];
    const next = levels[currentLevel + 1] || { xp: current.xp + 10000, title: 'Legend' };
    const progress = ((xp - current.xp) / (next.xp - current.xp)) * 100;
    return { level: currentLevel + 1, title: current.title, nextLevelXp: next.xp, progress: Math.min(100, Math.round(progress)) };
  }
}
