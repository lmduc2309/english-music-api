import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Gamification') @Controller('gamification') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
export class GamificationController {
  constructor(private svc: GamificationService) {}

  @Get('achievements') @ApiOperation({ summary: 'Get all achievements with unlock status' })
  getAchievements(@Request() req: any) { return this.svc.getUserAchievements(req.user.id); }

  @Get('stats') @ApiOperation({ summary: 'Get user stats' })
  getStats(@Request() req: any) { return this.svc.getUserStats(req.user.id); }
}
