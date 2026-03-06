import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from './entities/song.entity';
import { SongSentence } from './entities/song-sentence.entity';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Song, SongSentence])],
  controllers: [SongsController],
  providers: [SongsService],
  exports: [SongsService],
})
export class SongsModule {}
