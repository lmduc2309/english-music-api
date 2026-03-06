import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SongsService } from './songs.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CefrLevel } from '@/common/enums/cefr-level.enum';

@ApiTags('songs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all songs with filters' })
  @ApiQuery({ name: 'level', enum: CefrLevel, required: false })
  @ApiQuery({ name: 'genre', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('level') level?: CefrLevel,
    @Query('genre') genre?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.songsService.findAll({ level, genre, search, page, limit });
  }

  @Get('level/:level')
  @ApiOperation({ summary: 'Get songs by CEFR level' })
  getByLevel(@Param('level') level: CefrLevel) {
    return this.songsService.getByLevel(level);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get song details with sentences' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.songsService.findById(id);
  }

  @Get(':id/sentences')
  @ApiOperation({ summary: 'Get all sentences for a song' })
  getSentences(@Param('id', ParseUUIDPipe) id: string) {
    return this.songsService.getSentences(id);
  }
}
