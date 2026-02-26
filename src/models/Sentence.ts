import mongoose, { Document, Schema } from 'mongoose';

export interface IWord {
  text: string;
  phonetic: string;
  startTime: number;
  endTime: number;
  isKeyWord: boolean;
  definition?: string;
}

export interface ISentence extends Document {
  songId: mongoose.Types.ObjectId;
  index: number;
  text: string;
  phonetic: string;
  translation?: string;
  startTime: number;
  endTime: number;
  duration: number;
  referenceAudioUrl?: string;
  pitchData: number[];
  words: IWord[];
  difficulty: number;
  grammarNote?: string;
  vocabularyNote?: string;
}

const wordSchema = new Schema<IWord>(
  {
    text: { type: String, required: true },
    phonetic: { type: String, default: '' },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    isKeyWord: { type: Boolean, default: false },
    definition: String,
  },
  { _id: false }
);

const sentenceSchema = new Schema<ISentence>(
  {
    songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true, index: true },
    index: { type: Number, required: true },
    text: { type: String, required: true },
    phonetic: { type: String, default: '' },
    translation: String,
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    duration: { type: Number, required: true },
    referenceAudioUrl: String,
    pitchData: [{ type: Number }],
    words: [wordSchema],
    difficulty: { type: Number, min: 1, max: 10, default: 5 },
    grammarNote: String,
    vocabularyNote: String,
  },
  { timestamps: true }
);

sentenceSchema.index({ songId: 1, index: 1 }, { unique: true });

export default mongoose.model<ISentence>('Sentence', sentenceSchema);
