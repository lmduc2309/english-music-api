import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song, LyricLine, CefrLevel } from '../entities';
import { CreateSongDto, SongQueryDto } from './dto/song.dto';
import { YoutubeService } from '../youtube/youtube.service';

@Injectable()
export class SongsService {
  constructor(@InjectRepository(Song) private songRepo: Repository<Song>, @InjectRepository(LyricLine) private lyricRepo: Repository<LyricLine>, private youtubeService: YoutubeService) {}

  async create(dto: CreateSongDto): Promise<Song> {
    const videoInfo = await this.youtubeService.getVideoInfo(dto.youtubeVideoId);
    const song = this.songRepo.create({ title: dto.title||videoInfo.title, artist: dto.artist, youtubeVideoId: dto.youtubeVideoId, thumbnailUrl: videoInfo.thumbnailUrl, level: dto.level, genre: dto.genre, bpm: dto.bpm, durationSeconds: videoInfo.durationSeconds, totalLines: dto.lyrics.length, tags: dto.tags });
    const saved = await this.songRepo.save(song);
    const lyrics = dto.lyrics.map(l => this.lyricRepo.create({ songId: saved.id, lineNumber: l.lineNumber, text: l.text, phonetic: l.phonetic, startTime: l.startTime, endTime: l.endTime, keywords: l.keywords }));
    await this.lyricRepo.save(lyrics);
    return this.findOne(saved.id);
  }

  async findAll(query: SongQueryDto) {
    const { level, genre, search, page=1, limit=20 } = query;
    const qb = this.songRepo.createQueryBuilder('song').where('song.isActive = :active', { active: true });
    if (level) qb.andWhere('song.level = :level', { level });
    if (genre) qb.andWhere('song.genre = :genre', { genre });
    if (search) qb.andWhere('(song.title ILIKE :search OR song.artist ILIKE :search)', { search: `%${search}%` });
    qb.orderBy('song.level','ASC').addOrderBy('song.timesPlayed','DESC').skip((page-1)*limit).take(limit);
    const [songs, total] = await qb.getManyAndCount();
    return { songs, total, page, totalPages: Math.ceil(total/limit) };
  }

  async findOne(id: string): Promise<Song> {
    const song = await this.songRepo.findOne({ where:{id}, relations:['lyrics'], order:{lyrics:{lineNumber:'ASC'}} });
    if (!song) throw new NotFoundException('Song not found');
    return song;
  }

  async findByLevel(level: CefrLevel): Promise<Song[]> {
    return this.songRepo.find({ where:{level,isActive:true}, order:{timesPlayed:'DESC'} });
  }

  async getSongLyrics(songId: string): Promise<LyricLine[]> {
    return this.lyricRepo.find({ where:{songId}, order:{lineNumber:'ASC'} });
  }

  async incrementPlayCount(songId: string) { await this.songRepo.increment({id:songId},'timesPlayed',1); }

  async autoImportLyrics(songId: string): Promise<LyricLine[]> {
    const song = await this.findOne(songId);
    const captions = await this.youtubeService.fetchCaptions(song.youtubeVideoId);
    if (captions.length === 0) return [];
    const lyrics = captions.map((c,i) => this.lyricRepo.create({ songId:song.id, lineNumber:i+1, text:c.text, startTime:c.startTime, endTime:c.endTime }));
    await this.lyricRepo.delete({ songId:song.id });
    const saved = await this.lyricRepo.save(lyrics);
    await this.songRepo.update(song.id, { totalLines: saved.length });
    return saved;
  }
}
