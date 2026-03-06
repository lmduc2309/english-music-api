import { Injectable } from '@nestjs/common';

export interface DurationAnalysisResult {
  score: number;
  userDuration: number;
  expectedDuration: number;
  deviation: number;
  details: string;
}

@Injectable()
export class DurationAnalysisService {
  /**
   * Compare user's singing duration with expected duration.
   * Measures rhythm and tempo accuracy.
   */
  analyze(userDuration: number, expectedDuration: number): DurationAnalysisResult {
    if (expectedDuration <= 0) {
      return {
        score: 70,
        userDuration,
        expectedDuration,
        deviation: 0,
        details: 'Expected duration not available',
      };
    }

    // Calculate percentage deviation
    const deviation = Math.abs(userDuration - expectedDuration) / expectedDuration;

    // Score based on deviation:
    // 0-5% = 100, 5-10% = 90-100, 10-20% = 70-90, 20-40% = 40-70, >40% = 0-40
    let score: number;
    if (deviation <= 0.05) {
      score = 100;
    } else if (deviation <= 0.1) {
      score = 100 - (deviation - 0.05) * 200;
    } else if (deviation <= 0.2) {
      score = 90 - (deviation - 0.1) * 200;
    } else if (deviation <= 0.4) {
      score = 70 - (deviation - 0.2) * 150;
    } else {
      score = Math.max(0, 40 - (deviation - 0.4) * 100);
    }

    return {
      score: Math.round(Math.max(0, Math.min(100, score)) * 100) / 100,
      userDuration: Math.round(userDuration * 100) / 100,
      expectedDuration: Math.round(expectedDuration * 100) / 100,
      deviation: Math.round(deviation * 10000) / 100,
      details: this.getFeedback(deviation, userDuration > expectedDuration),
    };
  }

  private getFeedback(deviation: number, tooSlow: boolean): string {
    if (deviation <= 0.05) return 'Perfect timing!';
    if (deviation <= 0.1) return 'Great rhythm! Very close to the original tempo.';
    if (deviation <= 0.2) {
      return tooSlow
        ? 'A bit slow. Try to keep up with the original pace.'
        : 'A bit fast. Try to slow down to match the rhythm.';
    }
    return tooSlow
      ? 'Too slow. Listen to the tempo and try to match it.'
      : 'Too fast. Take your time and follow the melody.';
  }
}
