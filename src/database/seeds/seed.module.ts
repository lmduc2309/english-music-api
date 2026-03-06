import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from '@/modules/songs/entities/song.entity';
import { SongSentence } from '@/modules/songs/entities/song-sentence.entity';
import { Achievement } from '@/modules/achievements/entities/achievement.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Song, SongSentence, Achievement])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
