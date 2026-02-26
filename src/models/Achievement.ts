import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'practice' | 'streak' | 'level' | 'score' | 'social';
  xpReward: number;
  requirement: { type: string; value: number };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  earnedAt: Date;
}

const achievementSchema = new Schema<IAchievement>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, enum: ['practice', 'streak', 'level', 'score', 'social'], required: true },
  xpReward: { type: Number, default: 50 },
  requirement: { type: { type: String, required: true }, value: { type: Number, required: true } },
  rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], default: 'common' },
});

const userAchievementSchema = new Schema<IUserAchievement>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
  earnedAt: { type: Date, default: Date.now },
});

userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);
export const UserAchievement = mongoose.model<IUserAchievement>('UserAchievement', userAchievementSchema);
