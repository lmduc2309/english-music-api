import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('leaderboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('global')
  @ApiOperation({ summary: 'Get global XP leaderboard' })
  getGlobal(@Query('limit') limit?: number) {
    return this.leaderboardService.getGlobalLeaderboard(limit);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly score leaderboard' })
  getWeekly(@Query('limit') limit?: number) {
    return this.leaderboardService.getWeeklyLeaderboard(limit);
  }

  @Get('song/:songId')
  @ApiOperation({ summary: 'Get leaderboard for a specific song' })
  getSongLeaderboard(
    @Param('songId', ParseUUIDPipe) songId: string,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getSongLeaderboard(songId, limit);
  }
}
