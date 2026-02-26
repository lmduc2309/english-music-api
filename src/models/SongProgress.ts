import mongoose, { Document, Schema } from 'mongoose';

export interface ISongProgress extends Document {
  userId: mongoose.Types.ObjectId;
  songId: mongoose.Types.ObjectId;
  currentSentenceIndex: number;
  totalSentences: number;
  completedSentences: number[];
  sentenceScores: Map<string, number>;
  overallProgress: number;
  bestOverallScore: number;
  totalAttempts: number;
  totalTimeSpent: number;
  isCompleted: boolean;
  completedAt?: Date;
  startedAt: Date;
  lastPracticedAt: Date;
}

const songProgressSchema = new Schema<ISongProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
    currentSentenceIndex: { type: Number, default: 0 },
    totalSentences: { type: Number, required: true },
    completedSentences: [{ type: Number }],
    sentenceScores: { type: Map, of: Number, default: new Map() },
    overallProgress: { type: Number, default: 0 },
    bestOverallScore: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    startedAt: { type: Date, default: Date.now },
    lastPracticedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

songProgressSchema.index({ userId: 1, songId: 1 }, { unique: true });

export default mongoose.model<ISongProgress>('SongProgress', songProgressSchema);
