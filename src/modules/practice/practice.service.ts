import { Injectable, NotFoundException } from '@nestjs/common';
import PracticeAttempt from '../../models/PracticeAttempt';
import Sentence from '../../models/Sentence';
import User from '../../models/User';
import SongProgress from '../../models/SongProgress';
import Song from '../../models/Song';
import { ScoringService } from '../../services/scoring.service';
import { ProgressHelperService } from '../../services/progress-helper.service';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@Injectable()
export class PracticeService {
  constructor(
    private readonly scoringService: ScoringService,
    private readonly progressHelper: ProgressHelperService,
  ) {}

  async submitAttempt(userId: string, dto: SubmitAttemptDto) {
    const sentence = await Sentence.findById(dto.sentenceId);
    if (!sentence) throw new NotFoundException('Sentence not found');
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const prevAttempts = await PracticeAttempt.countDocuments({ userId, sentenceId: dto.sentenceId });

    const result = this.scoringService.calculateScore({
      userPitchData: dto.userPitchData,
      referencePitchData: sentence.pitchData || [],
      userDuration: dto.userDuration,
      referenceDuration: sentence.duration,
      spokenWords: dto.spokenWords,
      expectedWords: sentence.words.map(w => w.text),
    }, user.currentStreak);

    const attempt = await PracticeAttempt.create({
      userId, songId: dto.songId, sentenceId: dto.sentenceId,
      sentenceIndex: sentence.index,
      scores: result.scores,
      passed: result.passed,
      attemptNumber: prevAttempts + 1,
      wordScores: result.wordScores,
      xpEarned: result.xpEarned,
      feedback: result.feedback,
    });

    if (result.passed) {
      await this.progressHelper.updateUserProgress(userId, result.xpEarned, result.scores.overall);
      await this.progressHelper.updateSongProgress(userId, dto.songId, sentence.index);
      await this.progressHelper.updateStreak(userId);
    }

    // Check song completion
    const [song, progress] = await Promise.all([
      Song.findById(dto.songId),
      SongProgress.findOne({ userId, songId: dto.songId }),
    ]);
    const isSongComplete = !!(progress && song && progress.completedSentences.length >= song.totalSentences);
    if (isSongComplete) {
      await User.findByIdAndUpdate(userId, { $inc: { songsCompleted: 1 } });
      await Song.findByIdAndUpdate(dto.songId, { $inc: { completionCount: 1 } });
    }

    return {
      attempt: { id: attempt._id, scores: result.scores, passed: result.passed, attemptNumber: attempt.attemptNumber },
      feedback: result.feedback,
      xpEarned: result.xpEarned,
      wordScores: result.wordScores,
      needsPractice: result.wordScores.filter(w => !w.correct).map(w => w.word),
      canContinue: result.passed,
      nextSentenceIndex: result.passed ? sentence.index + 1 : sentence.index,
      isSongComplete,
    };
  }

  async getAttemptHistory(userId: string, query: { songId?: string; sentenceId?: string; page?: number; limit?: number }) {
    const { songId, sentenceId, page = 1, limit = 20 } = query;
    const filter: any = { userId };
    if (songId) filter.songId = songId;
    if (sentenceId) filter.sentenceId = sentenceId;
    const [attempts, total] = await Promise.all([
      PracticeAttempt.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('sentenceId', 'text index'),
      PracticeAttempt.countDocuments(filter),
    ]);
    return { attempts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getDailyStats(userId: string) {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const todayAttempts = await PracticeAttempt.find({ userId, createdAt: { $gte: startOfDay } });
    const passed = todayAttempts.filter(a => a.passed);
    return {
      totalAttempts: todayAttempts.length,
      sentencesPassed: passed.length,
      averageScore: passed.length ? Math.round(passed.reduce((s, a) => s + a.scores.overall, 0) / passed.length) : 0,
      xpEarned: todayAttempts.reduce((s, a) => s + a.xpEarned, 0),
      minutesPracticed: Math.round(todayAttempts.length * 0.5),
    };
  }
}
