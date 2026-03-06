import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get all song progress for current user' })
  getUserProgress(@CurrentUser('sub') userId: string) {
    return this.progressService.getUserProgress(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  getStats(@CurrentUser('sub') userId: string) {
    return this.progressService.getStats(userId);
  }

  @Get(':songId')
  @ApiOperation({ summary: 'Get progress for a specific song' })
  getSongProgress(
    @CurrentUser('sub') userId: string,
    @Param('songId', ParseUUIDPipe) songId: string,
  ) {
    return this.progressService.getSongProgress(userId, songId);
  }
}
