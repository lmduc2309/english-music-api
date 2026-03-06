import { Injectable } from '@nestjs/common';

export interface PitchDataPoint {
  time: number;
  frequency: number;
}

export interface PitchAnalysisResult {
  score: number;
  averageDeviation: number;
  details: string;
}

@Injectable()
export class PitchAnalysisService {
  /**
   * Compare user's pitch contour with the expected pitch contour.
   * Uses Dynamic Time Warping-inspired approach for flexible matching.
   */
  analyze(
    userPitch: PitchDataPoint[],
    expectedPitch: PitchDataPoint[],
  ): PitchAnalysisResult {
    if (!userPitch.length || !expectedPitch.length) {
      return { score: 70, averageDeviation: 0, details: 'Pitch data unavailable, default score applied' };
    }

    // Normalize both pitch arrays to same length for comparison
    const normalizedUser = this.normalizePitchArray(userPitch, 50);
    const normalizedExpected = this.normalizePitchArray(expectedPitch, 50);

    // Calculate cent-based deviation (musical pitch difference)
    let totalDeviation = 0;
    let validPoints = 0;

    for (let i = 0; i < normalizedUser.length; i++) {
      if (normalizedUser[i] > 0 && normalizedExpected[i] > 0) {
        const cents = Math.abs(
          1200 * Math.log2(normalizedUser[i] / normalizedExpected[i]),
        );
        totalDeviation += cents;
        validPoints++;
      }
    }

    if (validPoints === 0) {
      return { score: 50, averageDeviation: 0, details: 'Could not detect valid pitch' };
    }

    const avgDeviation = totalDeviation / validPoints;

    // Score: 100 cents = 1 semitone. Within 50 cents is good, 100 is ok
    let score: number;
    if (avgDeviation <= 25) score = 100;
    else if (avgDeviation <= 50) score = 95 - (avgDeviation - 25);
    else if (avgDeviation <= 100) score = 80 - (avgDeviation - 50) * 0.4;
    else if (avgDeviation <= 200) score = 60 - (avgDeviation - 100) * 0.2;
    else score = Math.max(20, 40 - (avgDeviation - 200) * 0.1);

    return {
      score: Math.round(Math.max(0, Math.min(100, score)) * 100) / 100,
      averageDeviation: Math.round(avgDeviation * 100) / 100,
      details: this.getPitchFeedback(avgDeviation),
    };
  }

  private normalizePitchArray(data: PitchDataPoint[], targetLength: number): number[] {
    const result: number[] = [];
    const step = data.length / targetLength;

    for (let i = 0; i < targetLength; i++) {
      const idx = Math.min(Math.floor(i * step), data.length - 1);
      result.push(data[idx].frequency);
    }

    return result;
  }

  private getPitchFeedback(avgDeviation: number): string {
    if (avgDeviation <= 25) return 'Excellent pitch accuracy!';
    if (avgDeviation <= 50) return 'Great pitch! Minor variations detected.';
    if (avgDeviation <= 100) return 'Good effort. Try matching the melody more closely.';
    if (avgDeviation <= 200) return 'Your pitch is off. Listen to the melody again carefully.';
    return 'Significant pitch difference. Focus on matching the notes.';
  }
}
