import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SongsModule } from './songs/songs.module';
import { PracticeModule } from './practice/practice.module';
import { ScoringModule } from './scoring/scoring.module';
import { VllmModule } from './vllm/vllm.module';
import { YoutubeModule } from './youtube/youtube.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { GamificationModule } from './gamification/gamification.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'english_music'),
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
      }),
    }),
    AuthModule, SongsModule, PracticeModule, ScoringModule,
    VllmModule, YoutubeModule, VocabularyModule,
    GamificationModule, LeaderboardModule,
  ],
})
export class AppModule {}
