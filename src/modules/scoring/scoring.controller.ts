import { Controller, Post, Get, Body, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SubmitScoreDto } from './dto/submit-score.dto';

@ApiTags('scoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post('evaluate')
  @ApiOperation({ summary: 'Submit a singing attempt for evaluation' })
  evaluate(
    @CurrentUser('sub') userId: string,
    @Body() submitDto: SubmitScoreDto,
  ) {
    return this.scoringService.evaluateAttempt(userId, submitDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get scoring history' })
  getHistory(
    @CurrentUser('sub') userId: string,
    @Query('songId') songId?: string,
  ) {
    return this.scoringService.getHistory(userId, songId);
  }
}
