import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from './entities/user-progress.entity';
import { ScoreRecord } from '../scoring/entities/score-record.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private readonly progressRepository: Repository<UserProgress>,
  ) {}

  async getUserProgress(userId: string) {
    return this.progressRepository.find({
      where: { userId },
      relations: ['song'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getSongProgress(userId: string, songId: string) {
    let progress = await this.progressRepository.findOne({
      where: { userId, songId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        songId,
        sentenceScores: [],
      });
      await this.progressRepository.save(progress);
    }

    return progress;
  }

  async updateSentenceProgress(
    userId: string,
    songId: string,
    sentenceId: string,
    sentenceIndex: number,
    scoreRecord: ScoreRecord,
  ) {
    let progress = await this.getSongProgress(userId, songId);

    // Update sentence scores
    const sentenceScores = progress.sentenceScores || [];
    const existingIdx = sentenceScores.findIndex(
      (s) => s.sentenceId === sentenceId,
    );

    const sentenceScore = {
      sentenceId,
      bestScore: scoreRecord.totalScore,
      attempts: 1,
      pitchScore: scoreRecord.pitchScore,
      durationScore: scoreRecord.durationScore,
      pronunciationScore: scoreRecord.pronunciationScore,
    };

    if (existingIdx >= 0) {
      const existing = sentenceScores[existingIdx];
      sentenceScore.attempts = existing.attempts + 1;
      sentenceScore.bestScore = Math.max(existing.bestScore, scoreRecord.totalScore);
      sentenceScores[existingIdx] = sentenceScore;
    } else {
      sentenceScores.push(sentenceScore);
    }

    // Update overall progress
    progress.sentenceScores = sentenceScores;
    progress.totalAttempts += 1;
    progress.lastCompletedSentenceIndex = Math.max(
      progress.lastCompletedSentenceIndex,
      sentenceIndex,
    );

    // Calculate averages
    const avgScores = sentenceScores.reduce(
      (acc, s) => ({
        pitch: acc.pitch + s.pitchScore,
        duration: acc.duration + s.durationScore,
        pronunciation: acc.pronunciation + s.pronunciationScore,
        overall: acc.overall + s.bestScore,
      }),
      { pitch: 0, duration: 0, pronunciation: 0, overall: 0 },
    );

    const count = sentenceScores.length;
    progress.averagePitchScore = avgScores.pitch / count;
    progress.averageDurationScore = avgScores.duration / count;
    progress.averagePronunciationScore = avgScores.pronunciation / count;
    progress.bestOverallScore = Math.max(
      progress.bestOverallScore,
      scoreRecord.totalScore,
    );

    await this.progressRepository.save(progress);
    return progress;
  }

  async markSongCompleted(userId: string, songId: string) {
    await this.progressRepository.update(
      { userId, songId },
      { isCompleted: true },
    );
  }

  async getStats(userId: string) {
    const allProgress = await this.progressRepository.find({
      where: { userId },
    });

    const completed = allProgress.filter((p) => p.isCompleted).length;
    const inProgress = allProgress.filter((p) => !p.isCompleted && p.totalAttempts > 0).length;
    const totalAttempts = allProgress.reduce((sum, p) => sum + p.totalAttempts, 0);
    const avgScore = allProgress.length
      ? allProgress.reduce((sum, p) => sum + p.bestOverallScore, 0) / allProgress.length
      : 0;

    return {
      songsCompleted: completed,
      songsInProgress: inProgress,
      totalAttempts,
      averageScore: Math.round(avgScore * 100) / 100,
    };
  }
}
