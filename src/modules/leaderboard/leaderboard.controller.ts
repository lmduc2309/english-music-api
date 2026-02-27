import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserId } from '../../common/decorators/current-user.decorator';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  getGlobalLeaderboard(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.leaderboardService.getGlobalLeaderboard(page, limit);
  }

  @Get('me')
  getUserRank(@UserId() userId: string) {
    return this.leaderboardService.getUserRank(userId);
  }

  @Get('level/:level')
  getLevelLeaderboard(@Param('level') level: string) {
    return this.leaderboardService.getLevelLeaderboard(level);
  }
}
