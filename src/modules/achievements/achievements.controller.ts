import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserId } from '../../common/decorators/current-user.decorator';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  getAllAchievements(@UserId() userId: string) {
    return this.achievementsService.getAllAchievements(userId);
  }

  @Get('mine')
  getMyAchievements(@UserId() userId: string) {
    return this.achievementsService.getMyAchievements(userId);
  }

  @Post('check')
  checkAchievements(@UserId() userId: string) {
    return this.achievementsService.checkAchievements(userId);
  }
}
