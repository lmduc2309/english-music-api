import { Injectable } from '@nestjs/common';

interface FeedbackInput {
  pronunciationResult: { score: number; details: string };
  pitchResult: { score: number; details: string };
  durationResult: { score: number; details: string };
  totalScore: number;
  passed: boolean;
}

@Injectable()
export class FeedbackService {
  /**
   * Generate intelligent, encouraging feedback based on all scoring dimensions.
   */
  generate(input: FeedbackInput): string {
    const parts: string[] = [];

    // Find weakest area
    const scores = [
      { name: 'Pronunciation', score: input.pronunciationResult.score },
      { name: 'Pitch', score: input.pitchResult.score },
      { name: 'Rhythm', score: input.durationResult.score },
    ].sort((a, b) => a.score - b.score);

    if (input.passed) {
      parts.push(`Score: ${Math.round(input.totalScore)}% - Passed!`);
      if (scores[0].score < 80) {
        parts.push(`Tip: Work on your ${scores[0].name.toLowerCase()} for an even better score.`);
      }
    } else {
      parts.push(`Score: ${Math.round(input.totalScore)}% - Need ${80}% to pass.`);
      parts.push(`Focus on: ${scores[0].name} (${Math.round(scores[0].score)}%).`);

      if (scores[0].name === 'Pronunciation') {
        parts.push('Listen carefully to each word and try again.');
      } else if (scores[0].name === 'Pitch') {
        parts.push('Try to match the melody more closely.');
      } else {
        parts.push('Match the speed of the original singer.');
      }
    }

    return parts.join(' ');
  }
}
