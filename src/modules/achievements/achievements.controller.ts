import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('achievements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available achievements' })
  getAll() {
    return this.achievementsService.getAllAchievements();
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get current user achievements' })
  getMine(@CurrentUser('sub') userId: string) {
    return this.achievementsService.getUserAchievements(userId);
  }
}
