import { Request, Response, NextFunction } from 'express';
import Song from '../models/Song';
import Sentence from '../models/Sentence';

export const getSongs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { level, genre, search, page = '1', limit = '20' } = req.query;
    const filter: any = { isActive: true };
    if (level) filter.level = level;
    if (genre) filter.genre = genre;
    if (search) filter.$text = { $search: search as string };
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const [songs, total] = await Promise.all([
      Song.find(filter).sort({ completionCount: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Song.countDocuments(filter),
    ]);
    res.json({ songs, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
};

export const getSongById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });
    res.json({ song });
  } catch (err) { next(err); }
};

export const getSongSentences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sentences = await Sentence.find({ songId: req.params.id }).sort({ index: 1 });
    res.json({ sentences });
  } catch (err) { next(err); }
};

export const getSentenceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sentence = await Sentence.findById(req.params.sentenceId);
    if (!sentence) return res.status(404).json({ error: 'Sentence not found' });
    res.json({ sentence });
  } catch (err) { next(err); }
};

export const getLevels = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const levels = await Song.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$level', songCount: { $sum: 1 }, avgDifficulty: { $avg: '$difficulty' } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ levels });
  } catch (err) { next(err); }
};
