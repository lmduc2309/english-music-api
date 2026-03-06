import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ScoreRecord } from './entities/score-record.entity';
import { PitchAnalysisService } from './services/pitch-analysis.service';
import { PronunciationService } from './services/pronunciation.service';
import { DurationAnalysisService } from './services/duration-analysis.service';
import { FeedbackService } from './services/feedback.service';
import { SongsService } from '../songs/songs.service';
import { ProgressService } from '../progress/progress.service';
import { UsersService } from '../users/users.service';
import { SubmitScoreDto } from './dto/submit-score.dto';

@Injectable()
export class ScoringService {
  private readonly pitchWeight: number;
  private readonly durationWeight: number;
  private readonly pronunciationWeight: number;
  private readonly minPassScore: number;

  constructor(
    @InjectRepository(ScoreRecord)
    private readonly scoreRepository: Repository<ScoreRecord>,
    private readonly pitchService: PitchAnalysisService,
    private readonly pronunciationService: PronunciationService,
    private readonly durationService: DurationAnalysisService,
    private readonly feedbackService: FeedbackService,
    private readonly songsService: SongsService,
    private readonly progressService: ProgressService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.pitchWeight = parseFloat(this.configService.get('PITCH_WEIGHT', '0.3'));
    this.durationWeight = parseFloat(this.configService.get('DURATION_WEIGHT', '0.2'));
    this.pronunciationWeight = parseFloat(this.configService.get('PRONUNCIATION_WEIGHT', '0.5'));
    this.minPassScore = parseFloat(this.configService.get('MIN_PASS_SCORE', '80'));
  }

  async evaluateAttempt(userId: string, dto: SubmitScoreDto) {
    const sentence = await this.songsService.getSentenceById(dto.sentenceId);

    // 1. Analyze pronunciation (word-by-word comparison)
    const pronunciationResult = this.pronunciationService.analyze(
      dto.recognizedText,
      sentence.text,
    );

    // 2. Analyze pitch accuracy
    const pitchResult = this.pitchService.analyze(
      dto.userPitchData || [],
      sentence.pitchContour || [],
    );

    // 3. Analyze duration/rhythm
    const durationResult = this.durationService.analyze(
      dto.userDuration,
      sentence.expectedDuration,
    );

    // 4. Calculate weighted total
    const totalScore =
      pronunciationResult.score * this.pronunciationWeight +
      pitchResult.score * this.pitchWeight +
      durationResult.score * this.durationWeight;

    const passed = totalScore >= this.minPassScore;

    // 5. Generate smart feedback
    const feedback = this.feedbackService.generate({
      pronunciationResult,
      pitchResult,
      durationResult,
      totalScore,
      passed,
    });

    // 6. Save score record
    const scoreRecord = this.scoreRepository.create({
      userId,
      songId: sentence.songId,
      sentenceId: sentence.id,
      pitchScore: Math.round(pitchResult.score * 100) / 100,
      durationScore: Math.round(durationResult.score * 100) / 100,
      pronunciationScore: Math.round(pronunciationResult.score * 100) / 100,
      totalScore: Math.round(totalScore * 100) / 100,
      passed,
      recognizedText: dto.recognizedText,
      wordAnalysis: pronunciationResult.wordAnalysis,
      userPitchData: dto.userPitchData,
      userDuration: dto.userDuration,
      feedback,
    });

    await this.scoreRepository.save(scoreRecord);

    // 7. Update progress if passed
    if (passed) {
      const xpEarned = this.calculateXp(totalScore, sentence.difficulty);
      await this.progressService.updateSentenceProgress(
        userId,
        sentence.songId,
        sentence.id,
        sentence.orderIndex,
        scoreRecord,
      );
      await this.usersService.addXp(userId, xpEarned);
      await this.usersService.updateStreak(userId);
    }

    return {
      scores: {
        pitch: scoreRecord.pitchScore,
        duration: scoreRecord.durationScore,
        pronunciation: scoreRecord.pronunciationScore,
        total: scoreRecord.totalScore,
      },
      passed,
      feedback,
      wordAnalysis: pronunciationResult.wordAnalysis,
      shouldRepeat: !passed,
      nextSentenceIndex: passed ? sentence.orderIndex + 1 : sentence.orderIndex,
      encouragement: this.getEncouragement(totalScore, passed),
    };
  }

  async getHistory(userId: string, songId?: string) {
    const where: any = { userId };
    if (songId) where.songId = songId;

    return this.scoreRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
      relations: ['sentence'],
    });
  }

  private calculateXp(score: number, difficulty: number): number {
    const baseXp = 10;
    const scoreMultiplier = score / 100;
    const difficultyBonus = difficulty * 2;
    return Math.round(baseXp * scoreMultiplier + difficultyBonus);
  }

  private getEncouragement(score: number, passed: boolean): string {
    if (score >= 95) return "Perfect! You're a natural singer! 🌟";
    if (score >= 90) return 'Amazing performance! Almost flawless! 🎵';
    if (score >= 80) return 'Great job! You nailed it! 🎤';
    if (score >= 70) return "Good effort! You're getting closer! 💪";
    if (score >= 60) return 'Nice try! Focus on the highlighted words. 🎯';
    return "Keep practicing! Listen carefully and try again. You've got this! 🎶";
  }
}
