import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SongsService } from './songs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('songs')
@UseGuards(JwtAuthGuard)
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  getSongs(
    @Query('level') level?: string,
    @Query('genre') genre?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.songsService.getSongs({ level, genre, search, page, limit });
  }

  @Get('levels')
  getLevels() {
    return this.songsService.getLevels();
  }

  @Get(':id')
  getSongById(@Param('id') id: string) {
    return this.songsService.getSongById(id);
  }

  @Get(':id/sentences')
  getSongSentences(@Param('id') id: string) {
    return this.songsService.getSongSentences(id);
  }

  @Get(':id/sentences/:sentenceId')
  getSentenceById(@Param('id') id: string, @Param('sentenceId') sentenceId: string) {
    return this.songsService.getSentenceById(id, sentenceId);
  }
}
