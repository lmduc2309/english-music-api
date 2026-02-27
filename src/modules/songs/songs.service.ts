import { Injectable, NotFoundException } from '@nestjs/common';
import Song from '../../models/Song';
import Sentence from '../../models/Sentence';

@Injectable()
export class SongsService {
  async getSongs(query: { level?: string; genre?: string; search?: string; page?: number; limit?: number }) {
    const { level, genre, search, page = 1, limit = 20 } = query;
    const filter: any = { isActive: true };
    if (level) filter.level = level;
    if (genre) filter.genre = genre;
    if (search) filter.$text = { $search: search };
    const [songs, total] = await Promise.all([
      Song.find(filter).sort({ completionCount: -1 }).skip((page - 1) * limit).limit(limit),
      Song.countDocuments(filter),
    ]);
    return { songs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getSongById(id: string) {
    const song = await Song.findById(id);
    if (!song) throw new NotFoundException('Song not found');
    return { song };
  }

  async getSongSentences(id: string) {
    const sentences = await Sentence.find({ songId: id }).sort({ index: 1 });
    return { sentences };
  }

  async getSentenceById(songId: string, sentenceId: string) {
    const sentence = await Sentence.findOne({ _id: sentenceId, songId });
    if (!sentence) throw new NotFoundException('Sentence not found');
    return { sentence };
  }

  async getLevels() {
    const levels = await Song.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$level', songCount: { $sum: 1 }, avgDifficulty: { $avg: '$difficulty' } } },
      { $sort: { _id: 1 } },
    ]);
    return { levels };
  }
}
