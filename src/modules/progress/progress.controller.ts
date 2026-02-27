import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserId } from '../../common/decorators/current-user.decorator';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  getUserProgress(@UserId() userId: string) {
    return this.progressService.getUserProgress(userId);
  }

  @Get('songs/:songId')
  getSongProgress(@UserId() userId: string, @Param('songId') songId: string) {
    return this.progressService.getSongProgress(userId, songId);
  }
}
