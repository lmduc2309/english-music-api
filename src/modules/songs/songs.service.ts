import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song } from './entities/song.entity';
import { SongSentence } from './entities/song-sentence.entity';
import { CefrLevel } from '@/common/enums/cefr-level.enum';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    @InjectRepository(SongSentence)
    private readonly sentenceRepository: Repository<SongSentence>,
  ) {}

  async findAll(query: {
    level?: CefrLevel;
    genre?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { level, genre, search, page = 1, limit = 20 } = query;
    const qb = this.songRepository
      .createQueryBuilder('song')
      .where('song.isActive = :active', { active: true });

    if (level) qb.andWhere('song.cefrLevel = :level', { level });
    if (genre) qb.andWhere('song.genre = :genre', { genre });
    if (search) {
      qb.andWhere(
        '(LOWER(song.title) LIKE :search OR LOWER(song.artist) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const [data, total] = await qb
      .orderBy('song.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const song = await this.songRepository.findOne({
      where: { id },
      relations: ['sentences'],
    });
    if (!song) throw new NotFoundException('Song not found');

    song.sentences?.sort((a, b) => a.orderIndex - b.orderIndex);
    return song;
  }

  async getSentences(songId: string) {
    const song = await this.songRepository.findOne({ where: { id: songId } });
    if (!song) throw new NotFoundException('Song not found');

    return this.sentenceRepository.find({
      where: { songId },
      order: { orderIndex: 'ASC' },
    });
  }

  async getSentenceById(sentenceId: string) {
    const sentence = await this.sentenceRepository.findOne({
      where: { id: sentenceId },
      relations: ['song'],
    });
    if (!sentence) throw new NotFoundException('Sentence not found');
    return sentence;
  }

  async incrementPlays(songId: string) {
    await this.songRepository.increment({ id: songId }, 'totalPlays', 1);
  }

  async getByLevel(level: CefrLevel) {
    return this.songRepository.find({
      where: { cefrLevel: level, isActive: true },
      order: { totalPlays: 'DESC' },
    });
  }
}
