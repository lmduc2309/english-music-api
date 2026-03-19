import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserProgress } from '../entities';

@Injectable()
export class LeaderboardService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>, @InjectRepository(UserProgress) private progressRepo: Repository<UserProgress>) {}

  async getGlobalLeaderboard(limit = 50) {
    const users = await this.userRepo.createQueryBuilder('user')
      .select(['user.id','user.displayName','user.avatarUrl','user.totalXp','user.currentStreak','user.currentLevel'])
      .orderBy('user.totalXp','DESC').take(limit).getMany();
    return users.map((u,i) => ({ rank:i+1, userId:u.id, displayName:u.displayName, avatarUrl:u.avatarUrl, totalXp:u.totalXp, currentStreak:u.currentStreak, level:u.currentLevel }));
  }

  async getWeeklyLeaderboard(limit = 50) {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
    const results = await this.progressRepo.createQueryBuilder('progress')
      .innerJoin('progress.user','user')
      .select('user.id','userId').addSelect('user.displayName','displayName').addSelect('user.avatarUrl','avatarUrl')
      .addSelect('SUM(progress.bestScore)','weeklyScore').addSelect('COUNT(DISTINCT progress.songId)','songsPlayed')
      .where('progress.lastPlayedAt >= :weekAgo',{weekAgo}).groupBy('user.id').addGroupBy('user.displayName').addGroupBy('user.avatarUrl')
      .orderBy('"weeklyScore"','DESC').limit(limit).getRawMany();
    return results.map((r:any,i:number) => ({ rank:i+1, userId:r.userId, displayName:r.displayName, avatarUrl:r.avatarUrl, weeklyScore:Math.round(parseFloat(r.weeklyScore)||0), songsPlayed:parseInt(r.songsPlayed)||0 }));
  }

  async getUserRank(userId: string) {
    const user = await this.userRepo.findOne({ where:{id:userId} });
    if (!user) return { rank:0, totalXp:0 };
    const rank = await this.userRepo.createQueryBuilder('user').where('user.totalXp > :xp',{xp:user.totalXp}).getCount();
    return { rank:rank+1, totalXp:user.totalXp, displayName:user.displayName };
  }
}
