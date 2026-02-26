export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CEFRLevel = typeof CEFR_LEVELS[number];

export const PASS_THRESHOLD = Number(process.env.PASS_THRESHOLD) || 80;

export const SCORING_WEIGHTS = {
  pitch: Number(process.env.PITCH_WEIGHT) || 0.25,
  duration: Number(process.env.DURATION_WEIGHT) || 0.25,
  pronunciation: Number(process.env.PRONUNCIATION_WEIGHT) || 0.50,
};

export const XP_CONFIG = {
  basePerSentence: Number(process.env.BASE_XP_PER_SENTENCE) || 10,
  bonusThreshold: Number(process.env.BONUS_XP_THRESHOLD) || 90,
  perfectThreshold: Number(process.env.PERFECT_XP_THRESHOLD) || 95,
  bonusXP: 5,
  perfectXP: 10,
  maxStreakMultiplier: Number(process.env.MAX_STREAK_MULTIPLIER) || 2.0,
};

export const GENRES = [
  'pop', 'rock', 'ballad', 'country', 'r&b', 'folk',
  'jazz', 'blues', 'hip-hop', 'children', 'musical', 'indie',
] as const;
