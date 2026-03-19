import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { Achievement, UserAchievement, User } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement, UserAchievement, User])],
  providers: [GamificationService],
  controllers: [GamificationController],
  exports: [GamificationService],
})
export class GamificationModule {}
