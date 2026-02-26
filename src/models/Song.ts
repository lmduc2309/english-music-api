import mongoose, { Document, Schema } from 'mongoose';
import { CEFRLevel } from '../config/constants';

export interface ISong extends Document {
  title: string;
  artist: string;
  level: CEFRLevel;
  genre: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  totalSentences: number;
  description: string;
  tags: string[];
  difficulty: number;
  bpm: number;
  language: { vocabularyLevel: string; grammarPoints: string[]; keyPhrases: string[] };
  completionCount: number;
  averageScore: number;
  isActive: boolean;
}

const songSchema = new Schema<ISong>(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], required: true, index: true },
    genre: { type: String, required: true, index: true },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    duration: { type: Number, required: true },
    totalSentences: { type: Number, default: 0 },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    difficulty: { type: Number, min: 1, max: 10, default: 5 },
    bpm: { type: Number, default: 120 },
    language: {
      vocabularyLevel: { type: String, default: '' },
      grammarPoints: [{ type: String }],
      keyPhrases: [{ type: String }],
    },
    completionCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

songSchema.index({ title: 'text', artist: 'text', tags: 'text' });

export default mongoose.model<ISong>('Song', songSchema);
