import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Leaderboard') @Controller('leaderboard')
export class LeaderboardController {
  constructor(private svc: LeaderboardService) {}

  @Get('global') @ApiOperation({ summary: 'Global XP leaderboard' })
  getGlobal(@Query('limit') limit?: number) { return this.svc.getGlobalLeaderboard(limit || 50); }

  @Get('weekly') @ApiOperation({ summary: 'Weekly leaderboard' })
  getWeekly(@Query('limit') limit?: number) { return this.svc.getWeeklyLeaderboard(limit || 50); }

  @Get('me') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user rank' })
  getMyRank(@Request() req: any) { return this.svc.getUserRank(req.user.id); }
}
