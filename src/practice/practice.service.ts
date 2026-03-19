import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeSession, SessionStatus, SentenceAttempt, LyricLine, Song, UserProgress, User } from '../entities';
import { ScoringService } from '../scoring/scoring.service';
import { StartSessionDto, SubmitAttemptDto } from './dto/practice.dto';

@Injectable()
export class PracticeService {
  constructor(
    @InjectRepository(PracticeSession) private sessionRepo: Repository<PracticeSession>,
    @InjectRepository(SentenceAttempt) private attemptRepo: Repository<SentenceAttempt>,
    @InjectRepository(LyricLine) private lyricRepo: Repository<LyricLine>,
    @InjectRepository(Song) private songRepo: Repository<Song>,
    @InjectRepository(UserProgress) private progressRepo: Repository<UserProgress>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private scoringService: ScoringService,
  ) {}

  async startSession(userId: string, dto: StartSessionDto): Promise<PracticeSession> {
    const song = await this.songRepo.findOne({ where: { id: dto.songId }, relations: ['lyrics'] });
    if (!song) throw new NotFoundException('Song not found');
    await this.songRepo.increment({ id: song.id }, 'timesPlayed', 1);
    const session = this.sessionRepo.create({ userId, songId: dto.songId, status: SessionStatus.IN_PROGRESS, currentLineIndex: 0, totalLinesCompleted: 0 });
    return this.sessionRepo.save(session);
  }

  async submitAttempt(userId: string, dto: SubmitAttemptDto) {
    const session = await this.sessionRepo.findOne({ where: { id: dto.sessionId, userId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.IN_PROGRESS) throw new BadRequestException('Session is not active');

    const lyricLine = await this.lyricRepo.findOne({ where: { id: dto.lyricLineId } });
    if (!lyricLine) throw new NotFoundException('Lyric line not found');

    const attemptCount = await this.attemptRepo.count({ where: { sessionId: session.id, lyricLineId: lyricLine.id } });
    const referenceDurationMs = (lyricLine.endTime - lyricLine.startTime) * 1000;
    const user = await this.userRepo.findOne({ where: { id: userId } });

    // Score the attempt via scoring engine + vLLM
    const result = await this.scoringService.scoreSentenceAttempt(
      lyricLine.text,
      { transcribedText: dto.transcribedText, pitchData: dto.pitchData || [], durationMs: dto.durationMs },
      referenceDurationMs,
      user?.nativeLanguage || 'vi',
    );

    // Save attempt record
    const attempt = this.attemptRepo.create({
      sessionId: session.id, lyricLineId: lyricLine.id, attemptNumber: attemptCount + 1,
      transcribedText: dto.transcribedText, pitchScore: result.pitchScore,
      pronunciationScore: result.pronunciationScore, timingScore: result.timingScore,
      wordAccuracyScore: result.wordAccuracyScore, totalScore: result.totalScore,
      passed: result.passed, wordDetails: result.wordDetails, aiFeedback: result.aiFeedback, pitchData: result.pitchData,
    });
    await this.attemptRepo.save(attempt);

    // Update session state
    session.totalAttempts += 1;
    if (result.passed) {
      session.totalLinesCompleted += 1;
      session.currentLineIndex += 1;
      const totalLines = await this.lyricRepo.count({ where: { songId: session.songId } });
      if (session.currentLineIndex >= totalLines) {
        session.status = SessionStatus.COMPLETED;
        session.completedAt = new Date();
      }
    }

    // Update running score averages
    const allAttempts = await this.attemptRepo.find({ where: { sessionId: session.id, passed: true } });
    if (allAttempts.length > 0) {
      session.pitchScore = this.avg(allAttempts, 'pitchScore');
      session.pronunciationScore = this.avg(allAttempts, 'pronunciationScore');
      session.timingScore = this.avg(allAttempts, 'timingScore');
      session.wordAccuracyScore = this.avg(allAttempts, 'wordAccuracyScore');
      session.overallScore = this.avg(allAttempts, 'totalScore');
    }
    await this.sessionRepo.save(session);

    // Calculate XP
    let xpEarned = 0;
    if (result.passed) {
      xpEarned = Math.round(result.totalScore / 10);
      if (attemptCount === 0) xpEarned += 5; // first-try bonus
      session.xpEarned += xpEarned;
      await this.sessionRepo.save(session);
      await this.updateUserProgress(userId, session, xpEarned);
    }

    return {
      attempt: { id: attempt.id, attemptNumber: attempt.attemptNumber, pitchScore: result.pitchScore, pronunciationScore: result.pronunciationScore, timingScore: result.timingScore, wordAccuracyScore: result.wordAccuracyScore, totalScore: result.totalScore, passed: result.passed, wordDetails: result.wordDetails, aiFeedback: result.aiFeedback },
      session: { currentLineIndex: session.currentLineIndex, totalLinesCompleted: session.totalLinesCompleted, status: session.status, overallScore: session.overallScore, xpEarned },
      nextAction: result.passed ? (session.status === SessionStatus.COMPLETED ? 'song_complete' : 'next_line') : 'retry',
    };
  }

  async getSession(sessionId: string, userId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId, userId }, relations: ['attempts', 'song'] });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async getUserSessions(userId: string, songId?: string) {
    const where: any = { userId };
    if (songId) where.songId = songId;
    return this.sessionRepo.find({ where, relations: ['song'], order: { startedAt: 'DESC' }, take: 50 });
  }

  async abandonSession(sessionId: string, userId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId, userId, status: SessionStatus.IN_PROGRESS } });
    if (!session) throw new NotFoundException('Active session not found');
    session.status = SessionStatus.ABANDONED;
    return this.sessionRepo.save(session);
  }

  private async updateUserProgress(userId: string, session: PracticeSession, xpEarned: number) {
    await this.userRepo.increment({ id: userId }, 'totalXp', xpEarned);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (user.lastPracticeDate) {
      const lastDate = new Date(user.lastPracticeDate); lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) user.currentStreak += 1;
      else if (diffDays > 1) user.currentStreak = 1;
    } else { user.currentStreak = 1; }
    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
    user.lastPracticeDate = today;
    await this.userRepo.save(user);

    // Update song progress
    let progress = await this.progressRepo.findOne({ where: { userId, songId: session.songId } });
    if (!progress) progress = this.progressRepo.create({ userId, songId: session.songId, totalLines: await this.lyricRepo.count({ where: { songId: session.songId } }) });
    progress.completedLines = Math.max(progress.completedLines, session.totalLinesCompleted);
    progress.totalAttempts += 1;
    progress.bestScore = Math.max(progress.bestScore, session.overallScore);
    progress.lastPlayedAt = new Date();
    if (session.status === SessionStatus.COMPLETED) {
      progress.isCompleted = true;
      if (session.overallScore >= 95) progress.stars = 3;
      else if (session.overallScore >= 85) progress.stars = Math.max(progress.stars, 2);
      else progress.stars = Math.max(progress.stars, 1);
    }
    await this.progressRepo.save(progress);
  }

  private avg(items: SentenceAttempt[], field: keyof SentenceAttempt): number {
    const vals = items.map((i) => Number(i[field]) || 0);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }
}
