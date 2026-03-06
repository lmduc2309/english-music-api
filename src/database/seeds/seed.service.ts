import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song } from '@/modules/songs/entities/song.entity';
import { SongSentence } from '@/modules/songs/entities/song-sentence.entity';
import { Achievement } from '@/modules/achievements/entities/achievement.entity';
import { CefrLevel } from '@/common/enums/cefr-level.enum';
import { Genre } from '@/common/enums/genre.enum';
import { AchievementType } from '@/common/enums/achievement-type.enum';
import { songSeeds } from './data/songs.seed';
import { achievementSeeds } from './data/achievements.seed';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Song)
    private songRepo: Repository<Song>,
    @InjectRepository(SongSentence)
    private sentenceRepo: Repository<SongSentence>,
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
  ) {}

  async run() {
    await this.seedAchievements();
    await this.seedSongs();
  }

  private async seedAchievements() {
    for (const data of achievementSeeds) {
      const exists = await this.achievementRepo.findOne({ where: { type: data.type } });
      if (!exists) {
        await this.achievementRepo.save(this.achievementRepo.create(data));
        console.log(`  Created achievement: ${data.name}`);
      }
    }
  }

  private async seedSongs() {
    for (const songData of songSeeds) {
      const exists = await this.songRepo.findOne({
        where: { title: songData.title, artist: songData.artist },
      });
      if (exists) continue;

      const { sentences, ...songInfo } = songData;
      const song = await this.songRepo.save(this.songRepo.create({
        ...songInfo,
        totalSentences: sentences.length,
      }));

      for (const sentenceData of sentences) {
        await this.sentenceRepo.save(
          this.sentenceRepo.create({ ...sentenceData, songId: song.id }),
        );
      }
      console.log(`  Created song: ${song.title} by ${song.artist} (${sentences.length} sentences)`);
    }
  }
}
