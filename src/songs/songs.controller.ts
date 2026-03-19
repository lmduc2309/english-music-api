import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { SongsService } from './songs.service';
import { CreateSongDto, SongQueryDto } from './dto/song.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CefrLevel } from '../entities';

@ApiTags('Songs') @Controller('songs')
export class SongsController {
  constructor(private songsService: SongsService) {}

  @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new song with lyrics' })
  create(@Body() dto: CreateSongDto) { return this.songsService.create(dto); }

  @Get() @ApiOperation({ summary: 'List songs with filters' })
  findAll(@Query() query: SongQueryDto) { return this.songsService.findAll(query); }

  @Get('level/:level') @ApiOperation({ summary: 'Get songs by CEFR level' })
  findByLevel(@Param('level') level: CefrLevel) { return this.songsService.findByLevel(level); }

  @Get(':id') @ApiOperation({ summary: 'Get song with lyrics' })
  findOne(@Param('id') id: string) { return this.songsService.findOne(id); }

  @Get(':id/lyrics') @ApiOperation({ summary: 'Get song lyrics' })
  getLyrics(@Param('id') id: string) { return this.songsService.getSongLyrics(id); }

  @Post(':id/auto-import-lyrics') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Auto-import lyrics from YouTube captions' })
  autoImportLyrics(@Param('id') id: string) { return this.songsService.autoImportLyrics(id); }
}
