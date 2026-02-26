import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { CEFRLevel } from '../config/constants';

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  displayName: string;
  avatar?: string;
  currentLevel: CEFRLevel;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: Date;
  songsCompleted: number;
  sentencesPracticed: number;
  averageScore: number;
  preferredGenres: string[];
  dailyGoal: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    password: { type: String, required: true, minlength: 6, select: false },
    displayName: { type: String, required: true, trim: true },
    avatar: String,
    currentLevel: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], default: 'A1' },
    totalXP: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastPracticeDate: Date,
    songsCompleted: { type: Number, default: 0 },
    sentencesPracticed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    preferredGenres: [{ type: String }],
    dailyGoal: { type: Number, default: 15 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
