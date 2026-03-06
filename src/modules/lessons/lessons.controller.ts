import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CefrLevel } from '@/common/enums/cefr-level.enum';

@ApiTags('lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':songId')
  @ApiOperation({ summary: 'Start or continue a song lesson' })
  getLesson(
    @CurrentUser('sub') userId: string,
    @Param('songId', ParseUUIDPipe) songId: string,
  ) {
    return this.lessonsService.getLesson(userId, songId);
  }

  @Get('recommendations/:level')
  @ApiOperation({ summary: 'Get recommended songs for user level' })
  getRecommendations(
    @CurrentUser('sub') userId: string,
    @Param('level') level: CefrLevel,
  ) {
    return this.lessonsService.getRecommendations(userId, level);
  }
}
