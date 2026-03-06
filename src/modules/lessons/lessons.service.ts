import { Injectable } from '@nestjs/common';
import { SongsService } from '../songs/songs.service';
import { ProgressService } from '../progress/progress.service';
import { CefrLevel, CEFR_LEVEL_ORDER } from '@/common/enums/cefr-level.enum';

@Injectable()
export class LessonsService {
  constructor(
    private readonly songsService: SongsService,
    private readonly progressService: ProgressService,
  ) {}

  /**
   * Get a structured lesson for a song: sentence by sentence with progress info
   */
  async getLesson(userId: string, songId: string) {
    const song = await this.songsService.findById(songId);
    const progress = await this.progressService.getSongProgress(userId, songId);
    const sentences = await this.songsService.getSentences(songId);

    // Increment play count
    await this.songsService.incrementPlays(songId);

    const sentenceScoresMap = new Map(
      (progress.sentenceScores || []).map((s) => [s.sentenceId, s]),
    );

    const lessonSentences = sentences.map((sentence, index) => {
      const scoreData = sentenceScoresMap.get(sentence.id);
      return {
        ...sentence,
        isUnlocked: index <= progress.lastCompletedSentenceIndex + 1,
        isCompleted: scoreData ? scoreData.bestScore >= 80 : false,
        bestScore: scoreData?.bestScore || 0,
        attempts: scoreData?.attempts || 0,
      };
    });

    return {
      song: {
        id: song.id,
        title: song.title,
        artist: song.artist,
        videoUrl: song.videoUrl,
        thumbnailUrl: song.thumbnailUrl,
        cefrLevel: song.cefrLevel,
        duration: song.duration,
        bpm: song.bpm,
        vocabulary: song.vocabulary,
      },
      progress: {
        completedSentences: progress.lastCompletedSentenceIndex + 1,
        totalSentences: sentences.length,
        percentComplete: sentences.length
          ? Math.round(((progress.lastCompletedSentenceIndex + 1) / sentences.length) * 100)
          : 0,
        bestOverallScore: progress.bestOverallScore,
        isCompleted: progress.isCompleted,
      },
      sentences: lessonSentences,
    };
  }

  /**
   * Get recommended songs based on user level and progress
   */
  async getRecommendations(userId: string, userLevel: CefrLevel) {
    const levelOrder = CEFR_LEVEL_ORDER[userLevel];
    const levels = Object.entries(CEFR_LEVEL_ORDER)
      .filter(([, order]) => order >= levelOrder - 1 && order <= levelOrder + 1)
      .map(([level]) => level as CefrLevel);

    const userProgress = await this.progressService.getUserProgress(userId);
    const completedSongIds = new Set(
      userProgress.filter((p) => p.isCompleted).map((p) => p.songId),
    );

    const recommendations: any[] = [];
    for (const level of levels) {
      const songs = await this.songsService.getByLevel(level);
      const uncompletedSongs = songs.filter((s) => !completedSongIds.has(s.id));
      recommendations.push(...uncompletedSongs.slice(0, 5));
    }

    return recommendations.slice(0, 10);
  }
}
