import { Injectable } from '@nestjs/common';

export interface WordAnalysis {
  word: string;
  expected: string;
  isCorrect: boolean;
  confidence: number;
  phonemeAccuracy?: number;
}

export interface PronunciationResult {
  score: number;
  wordAnalysis: WordAnalysis[];
  correctWords: number;
  totalWords: number;
  details: string;
}

@Injectable()
export class PronunciationService {
  /**
   * Analyze pronunciation by comparing recognized text with expected text.
   * Uses word-level comparison with fuzzy matching for partial credit.
   */
  analyze(recognizedText: string, expectedText: string): PronunciationResult {
    const recognized = this.normalizeText(recognizedText).split(/\s+/);
    const expected = this.normalizeText(expectedText).split(/\s+/);

    const wordAnalysis: WordAnalysis[] = [];
    let totalScore = 0;
    let correctWords = 0;

    // Use Levenshtein-based alignment for word matching
    const alignment = this.alignWords(recognized, expected);

    for (const pair of alignment) {
      const similarity = this.calculateSimilarity(
        pair.recognized || '',
        pair.expected,
      );

      const isCorrect = similarity >= 0.8;
      if (isCorrect) correctWords++;

      wordAnalysis.push({
        word: pair.recognized || '(missed)',
        expected: pair.expected,
        isCorrect,
        confidence: similarity,
        phonemeAccuracy: similarity * 100,
      });

      totalScore += similarity;
    }

    const score = expected.length > 0
      ? (totalScore / expected.length) * 100
      : 0;

    return {
      score: Math.round(Math.max(0, Math.min(100, score)) * 100) / 100,
      wordAnalysis,
      correctWords,
      totalWords: expected.length,
      details: this.getFeedback(score, correctWords, expected.length),
    };
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private alignWords(
    recognized: string[],
    expected: string[],
  ): { recognized: string | null; expected: string }[] {
    const result: { recognized: string | null; expected: string }[] = [];
    let rIdx = 0;

    for (const expWord of expected) {
      if (rIdx < recognized.length) {
        const sim = this.calculateSimilarity(recognized[rIdx], expWord);
        // Check if next word is a better match (handles insertions)
        if (
          rIdx + 1 < recognized.length &&
          sim < 0.5 &&
          this.calculateSimilarity(recognized[rIdx + 1], expWord) > sim
        ) {
          rIdx++; // Skip the extra word
        }
        result.push({ recognized: recognized[rIdx], expected: expWord });
        rIdx++;
      } else {
        result.push({ recognized: null, expected: expWord });
      }
    }

    return result;
  }

  /**
   * Calculate similarity between two words using Levenshtein distance.
   * Returns a value between 0 (completely different) and 1 (identical).
   */
  private calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (!a || !b) return 0;

    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;

    const distance = this.levenshteinDistance(a, b);
    return 1 - distance / maxLen;
  }

  private levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0),
    );

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost,
        );
      }
    }

    return dp[m][n];
  }

  private getFeedback(score: number, correct: number, total: number): string {
    if (score >= 95) return 'Perfect pronunciation!';
    if (score >= 80) return `Great! ${correct}/${total} words correct.`;
    if (score >= 60) return `Good effort! ${correct}/${total} words. Practice the highlighted words.`;
    return `${correct}/${total} words correct. Listen again and focus on each word.`;
  }
}
