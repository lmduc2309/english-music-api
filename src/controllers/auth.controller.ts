import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password, displayName } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ error: 'Email or username already exists' });
    const user = await User.create({ email, username, password, displayName });
    const token = signToken(user._id as string);
    res.status(201).json({ token, user: { id: user._id, email: user.email, username: user.username, displayName: user.displayName, currentLevel: user.currentLevel, totalXP: user.totalXP } });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: 'Invalid email or password' });
    const token = signToken(user._id as string);
    res.json({ token, user: { id: user._id, email: user.email, username: user.username, displayName: user.displayName, currentLevel: user.currentLevel, totalXP: user.totalXP, currentStreak: user.currentStreak, songsCompleted: user.songsCompleted, averageScore: user.averageScore } });
  } catch (err) { next(err); }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req as any).userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { displayName, avatar, preferredGenres, dailyGoal } = req.body;
    const user = await User.findByIdAndUpdate((req as any).userId, { displayName, avatar, preferredGenres, dailyGoal }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
};
