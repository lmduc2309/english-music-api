import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { Song, LyricLine } from '../entities';
import { YoutubeModule } from '../youtube/youtube.module';

@Module({
  imports: [TypeOrmModule.forFeature([Song, LyricLine]), YoutubeModule],
  providers: [SongsService],
  controllers: [SongsController],
  exports: [SongsService],
})
export class SongsModule {}
