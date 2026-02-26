import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const getGlobalLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const users = await User.find()
      .select('username displayName avatar totalXP currentLevel currentStreak songsCompleted averageScore')
      .sort({ totalXP: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    const total = await User.countDocuments();
    const ranked = users.map((u, i) => ({ rank: (pageNum - 1) * limitNum + i + 1, ...u.toObject() }));
    res.json({ leaderboard: ranked, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
};

export const getLevelLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { level } = req.params;
    const users = await User.find({ currentLevel: level })
      .select('username displayName avatar totalXP currentStreak songsCompleted averageScore')
      .sort({ totalXP: -1 })
      .limit(50);
    const ranked = users.map((u, i) => ({ rank: i + 1, ...u.toObject() }));
    res.json({ level, leaderboard: ranked });
  } catch (err) { next(err); }
};

export const getUserRank = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const globalRank = await User.countDocuments({ totalXP: { $gt: user.totalXP } }) + 1;
    const levelRank = await User.countDocuments({ currentLevel: user.currentLevel, totalXP: { $gt: user.totalXP } }) + 1;
    res.json({ globalRank, levelRank, level: user.currentLevel, totalXP: user.totalXP });
  } catch (err) { next(err); }
};
