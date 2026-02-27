import { Request, Response } from 'express';
import User from '../models/User';

/** GET /api/users/profile */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/** PUT /api/users/profile */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { displayName, avatar, preferredGenres, dailyGoal } = req.body;
    const updates: Record<string, any> = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (avatar !== undefined) updates.avatar = avatar;
    if (preferredGenres !== undefined) updates.preferredGenres = preferredGenres;
    if (dailyGoal !== undefined) updates.dailyGoal = dailyGoal;

    const user = await User.findByIdAndUpdate(
      (req as any).userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/** PUT /api/users/change-password */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById((req as any).userId).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};

/** GET /api/users/stats */
export const getStats = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).select(
      'totalXP currentStreak longestStreak songsCompleted sentencesPracticed averageScore currentLevel lastPracticeDate'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ stats: user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
