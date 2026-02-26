import mongoose, { Document, Schema } from 'mongoose';

export interface IWordScore {
  word: string;
  correct: boolean;
  spokenAs?: string;
  score: number;
}

export interface IPracticeAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  songId: mongoose.Types.ObjectId;
  sentenceId: mongoose.Types.ObjectId;
  sentenceIndex: number;
  scores: { pitch: number; duration: number; pronunciation: number; overall: number };
  passed: boolean;
  attemptNumber: number;
  audioRecordingUrl?: string;
  wordScores: IWordScore[];
  xpEarned: number;
  feedback: string[];
  createdAt: Date;
}

const wordScoreSchema = new Schema<IWordScore>(
  { word: { type: String, required: true }, correct: { type: Boolean, required: true }, spokenAs: String, score: { type: Number, required: true } },
  { _id: false }
);

const practiceAttemptSchema = new Schema<IPracticeAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
    sentenceId: { type: Schema.Types.ObjectId, ref: 'Sentence', required: true },
    sentenceIndex: { type: Number, required: true },
    scores: {
      pitch: { type: Number, required: true, min: 0, max: 100 },
      duration: { type: Number, required: true, min: 0, max: 100 },
      pronunciation: { type: Number, required: true, min: 0, max: 100 },
      overall: { type: Number, required: true, min: 0, max: 100 },
    },
    passed: { type: Boolean, required: true },
    attemptNumber: { type: Number, default: 1 },
    audioRecordingUrl: String,
    wordScores: [wordScoreSchema],
    xpEarned: { type: Number, default: 0 },
    feedback: [{ type: String }],
  },
  { timestamps: true }
);

practiceAttemptSchema.index({ userId: 1, songId: 1, sentenceId: 1 });
practiceAttemptSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IPracticeAttempt>('PracticeAttempt', practiceAttemptSchema);
