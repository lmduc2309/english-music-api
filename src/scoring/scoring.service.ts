import { Injectable, Logger } from '@nestjs/common';
import { VllmService, PronunciationAssessment } from '../vllm/vllm.service';

export interface AudioAnalysis { transcribedText: string; pitchData: { time: number; frequency: number }[]; durationMs: number; }
export interface ScoringResult { pitchScore: number; pronunciationScore: number; timingScore: number; wordAccuracyScore: number; totalScore: number; passed: boolean; wordDetails: PronunciationAssessment['wordDetails']; aiFeedback: string; pitchData: { time: number; frequency: number }[]; }

const PASS_THRESHOLD = 80;
const WEIGHTS = { pitch: 0.3, pronunciation: 0.3, timing: 0.2, wordAccuracy: 0.2 };

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);
  constructor(private vllmService: VllmService) {}

  async scoreSentenceAttempt(originalText: string, audio: AudioAnalysis, referenceDurationMs: number, nativeLanguage = 'vi'): Promise<ScoringResult> {
    const wordAccuracyScore = this.calculateWordAccuracy(originalText, audio.transcribedText);
    const pitchScore = this.calculatePitchScore(audio.pitchData);
    const timingScore = this.calculateTimingScore(audio.durationMs, referenceDurationMs);
    const assessment = await this.vllmService.assessPronunciation(originalText, audio.transcribedText, nativeLanguage);
    const pronunciationScore = assessment.overallScore;
    const totalScore = Math.round(WEIGHTS.pitch*pitchScore + WEIGHTS.pronunciation*pronunciationScore + WEIGHTS.timing*timingScore + WEIGHTS.wordAccuracy*wordAccuracyScore);
    const aiFeedback = await this.vllmService.generateFeedback(originalText, audio.transcribedText, { pitch: pitchScore, timing: timingScore, pronunciation: pronunciationScore, wordAccuracy: wordAccuracyScore }, nativeLanguage);
    return { pitchScore: Math.round(pitchScore), pronunciationScore: Math.round(pronunciationScore), timingScore: Math.round(timingScore), wordAccuracyScore: Math.round(wordAccuracyScore), totalScore, passed: totalScore >= PASS_THRESHOLD, wordDetails: assessment.wordDetails, aiFeedback, pitchData: audio.pitchData };
  }

  private calculateWordAccuracy(original: string, transcribed: string): number {
    const origWords = original.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/).filter(Boolean);
    const transWords = transcribed.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/).filter(Boolean);
    if (origWords.length === 0) return 0;
    let matches = 0; const used = new Set<number>();
    for (const origWord of origWords) {
      let bestIdx = -1, bestSim = 0;
      for (let j = 0; j < transWords.length; j++) {
        if (used.has(j)) continue;
        const sim = this.wordSimilarity(origWord, transWords[j]);
        if (sim > bestSim) { bestSim = sim; bestIdx = j; }
      }
      if (bestIdx >= 0 && bestSim >= 0.6) { matches += bestSim; used.add(bestIdx); }
    }
    return Math.min(100, (matches / origWords.length) * 100);
  }

  private wordSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - this.levenshteinDistance(a, b) / maxLen;
  }

  private levenshteinDistance(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[m][n];
  }

  private calculatePitchScore(pitchData: { time: number; frequency: number }[]): number {
    if (!pitchData || pitchData.length < 2) return 70;
    const valid = pitchData.map(p => p.frequency).filter(f => f > 50 && f < 1000);
    if (valid.length < 2) return 60;
    const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
    const variance = valid.reduce((a, f) => a + (f - mean)**2, 0) / valid.length;
    const cv = Math.sqrt(variance) / mean;
    if (cv < 0.08) return 95; if (cv < 0.15) return 85; if (cv < 0.25) return 75; if (cv < 0.35) return 60; return 45;
  }

  private calculateTimingScore(actualMs: number, referenceMs: number): number {
    if (referenceMs <= 0) return 70;
    const dev = Math.abs(1 - actualMs / referenceMs);
    if (dev < 0.1) return 95; if (dev < 0.2) return 85; if (dev < 0.35) return 70; if (dev < 0.5) return 55; return 35;
  }
}
