import { Controller, Post, Get, Param, Body, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PracticeService } from './practice.service';
import { StartSessionDto, SubmitAttemptDto } from './dto/practice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Practice') @Controller('practice') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
export class PracticeController {
  constructor(private practiceService: PracticeService) {}

  @Post('sessions/start') @ApiOperation({ summary: 'Start a new practice session' })
  startSession(@Request() req: any, @Body() dto: StartSessionDto) {
    return this.practiceService.startSession(req.user.id, dto);
  }

  @Post('attempts/submit') @ApiOperation({ summary: 'Submit a singing attempt for scoring' })
  submitAttempt(@Request() req: any, @Body() dto: SubmitAttemptDto) {
    return this.practiceService.submitAttempt(req.user.id, dto);
  }

  @Get('sessions/:id') @ApiOperation({ summary: 'Get session details' })
  getSession(@Request() req: any, @Param('id') id: string) {
    return this.practiceService.getSession(id, req.user.id);
  }

  @Get('sessions') @ApiOperation({ summary: 'Get user practice sessions' })
  getUserSessions(@Request() req: any, @Query('songId') songId?: string) {
    return this.practiceService.getUserSessions(req.user.id, songId);
  }

  @Patch('sessions/:id/abandon') @ApiOperation({ summary: 'Abandon session' })
  abandonSession(@Request() req: any, @Param('id') id: string) {
    return this.practiceService.abandonSession(id, req.user.id);
  }
}
