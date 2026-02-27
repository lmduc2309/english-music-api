import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SongsModule } from './modules/songs/songs.module';
import { PracticeModule } from './modules/practice/practice.module';
import { ProgressModule } from './modules/progress/progress.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { AchievementsModule } from './modules/achievements/achievements.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 15 * 60 * 1000, limit: 200 }]),
    AuthModule,
    UsersModule,
    SongsModule,
    PracticeModule,
    ProgressModule,
    LeaderboardModule,
    AchievementsModule,
  ],
})
export class AppModule {}
