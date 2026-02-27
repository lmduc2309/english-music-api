import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserId } from '../../common/decorators/current-user.decorator';

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('attempt')
  submitAttempt(@UserId() userId: string, @Body() dto: SubmitAttemptDto) {
    return this.practiceService.submitAttempt(userId, dto);
  }

  @Get('history')
  getAttemptHistory(
    @UserId() userId: string,
    @Query('songId') songId?: string,
    @Query('sentenceId') sentenceId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.practiceService.getAttemptHistory(userId, { songId, sentenceId, page, limit });
  }

  @Get('daily-stats')
  getDailyStats(@UserId() userId: string) {
    return this.practiceService.getDailyStats(userId);
  }
}
