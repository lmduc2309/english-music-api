import { Injectable } from '@nestjs/common';
import { SCORING_WEIGHTS, PASS_THRESHOLD, XP_CONFIG } from '../common/constants';

export interface IWordScore { word: string; correct: boolean; spokenAs?: string; score: number; }
export interface ScoringInput {
  userPitchData: number[];
  referencePitchData: number[];
  userDuration: number;
  referenceDuration: number;
  spokenWords: string[];
  expectedWords: string[];
}
export interface ScoringResult {
  scores: { pitch: number; duration: number; pronunciation: number; overall: number };
  passed: boolean;
  wordScores: IWordScore[];
  feedback: string[];
  xpEarned: number;
}

@Injectable()
export class ScoringService {
  calculateScore(input: ScoringInput, currentStreak = 0): ScoringResult {
    const pitchScore = this.calculatePitchScore(input.userPitchData, input.referencePitchData);
    const durationScore = this.calculateDurationScore(input.userDuration, input.referenceDuration);
    const { pronunciationScore, wordScores } = this.calculatePronunciationScore(input.spokenWords, input.expectedWords);
    const overall = Math.round(pitchScore * SCORING_WEIGHTS.pitch + durationScore * SCORING_WEIGHTS.duration + pronunciationScore * SCORING_WEIGHTS.pronunciation);
    const passed = overall >= PASS_THRESHOLD;
    const feedback = this.generateFeedback(pitchScore, durationScore, pronunciationScore, wordScores);
    const xpEarned = passed ? this.calculateXP(overall, currentStreak) : 0;
    return { scores: { pitch: Math.round(pitchScore), duration: Math.round(durationScore), pronunciation: Math.round(pronunciationScore), overall }, passed, wordScores, feedback, xpEarned };
  }

  calculatePitchScore(userPitch: number[], refPitch: number[]): number {
    if (!userPitch.length || !refPitch.length) return 0;
    const len = Math.min(userPitch.length, refPitch.length, 100);
    const normUser = this.resampleArray(userPitch, len);
    const normRef = this.resampleArray(refPitch, len);
    const refMean = normRef.reduce((a, b) => a + b, 0) / normRef.length;
    let total = 0;
    for (let i = 0; i < len; i++) {
      const r = normRef[i] || refMean;
      const u = normUser[i] || refMean;
      if (r > 0 && u > 0) total += Math.max(0, 1 - Math.abs(12 * Math.log2(u / r)) / 6);
    }
    return (total / len) * 100;
  }

  calculateDurationScore(userDuration: number, refDuration: number): number {
    if (refDuration <= 0) return 0;
    const deviation = Math.abs(1 - userDuration / refDuration);
    if (deviation <= 0.2) return 100;
    if (deviation >= 0.6) return 0;
    return Math.round((1 - (deviation - 0.2) / 0.4) * 100);
  }

  calculatePronunciationScore(spokenWords: string[], expectedWords: string[]): { pronunciationScore: number; wordScores: IWordScore[] } {
    const wordScores: IWordScore[] = [];
    let totalScore = 0;
    const normSpoken = spokenWords.map(w => w.toLowerCase().replace(/[^a-z']/g, ''));
    const normExpected = expectedWords.map(w => w.toLowerCase().replace(/[^a-z']/g, ''));
    for (let i = 0; i < normExpected.length; i++) {
      const expected = normExpected[i];
      const spoken = normSpoken[i] || '';
      if (!expected) continue;
      const similarity = this.wordSimilarity(spoken, expected);
      wordScores.push({ word: expectedWords[i], correct: similarity >= 0.8, spokenAs: spoken !== expected ? spokenWords[i] : undefined, score: Math.round(similarity * 100) });
      totalScore += similarity;
    }
    return { pronunciationScore: normExpected.length > 0 ? (totalScore / normExpected.length) * 100 : 0, wordScores };
  }

  wordSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++)
      for (let j = 1; j <= a.length; j++)
        matrix[i][j] = b[i-1] === a[j-1] ? matrix[i-1][j-1] : Math.min(matrix[i-1][j-1]+1, matrix[i][j-1]+1, matrix[i-1][j]+1);
    return 1 - matrix[b.length][a.length] / Math.max(a.length, b.length);
  }

  resampleArray(arr: number[], targetLength: number): number[] {
    if (arr.length === targetLength) return arr;
    if (!arr.length) return new Array(targetLength).fill(0);
    const result: number[] = [];
    const ratio = (arr.length - 1) / (targetLength - 1);
    for (let i = 0; i < targetLength; i++) {
      const idx = i * ratio;
      const lo = Math.floor(idx);
      const hi = Math.min(Math.ceil(idx), arr.length - 1);
      result.push(arr[lo] * (1 - (idx - lo)) + arr[hi] * (idx - lo));
    }
    return result;
  }

  generateFeedback(pitch: number, duration: number, pronunciation: number, wordScores: IWordScore[]): string[] {
    const fb: string[] = [];
    if (pitch >= 90) fb.push('Amazing pitch! You hit the notes perfectly!');
    else if (pitch >= 70) fb.push('Good pitch! A few notes were slightly off.');
    else if (pitch >= 50) fb.push('Keep working on the notes. Try humming the melody first.');
    else fb.push('Listen to the melody again carefully before singing.');
    if (duration >= 90) fb.push('Perfect timing and rhythm!');
    else if (duration >= 70) fb.push('Good rhythm! Try to match the pace more closely.');
    else fb.push('Focus on the rhythm. Try clapping the beat before singing.');
    if (pronunciation >= 90) fb.push('Excellent pronunciation!');
    else if (pronunciation >= 70) fb.push('Good pronunciation! A few words need work.');
    else fb.push('Listen carefully to each word and try again.');
    const incorrect = wordScores.filter(w => !w.correct);
    if (incorrect.length > 0 && incorrect.length <= 3) fb.push(`Pay attention to: ${incorrect.map(w => `"${w.word}"`).join(', ')}`);
    else if (incorrect.length > 3) fb.push(`${incorrect.length} words need improvement. Listen and try again!`);
    return fb;
  }

  calculateXP(overallScore: number, currentStreak: number): number {
    let xp = XP_CONFIG.basePerSentence;
    if (overallScore >= XP_CONFIG.perfectThreshold) xp += XP_CONFIG.perfectXP;
    else if (overallScore >= XP_CONFIG.bonusThreshold) xp += XP_CONFIG.bonusXP;
    return Math.round(xp * Math.min(1 + currentStreak * 0.1, XP_CONFIG.maxStreakMultiplier));
  }
}
