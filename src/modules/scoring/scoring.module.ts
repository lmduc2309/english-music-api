import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreRecord } from './entities/score-record.entity';
import { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';
import { PitchAnalysisService } from './services/pitch-analysis.service';
import { PronunciationService } from './services/pronunciation.service';
import { DurationAnalysisService } from './services/duration-analysis.service';
import { FeedbackService } from './services/feedback.service';
import { SongsModule } from '../songs/songs.module';
import { ProgressModule } from '../progress/progress.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScoreRecord]),
    SongsModule,
    ProgressModule,
    UsersModule,
  ],
  controllers: [ScoringController],
  providers: [
    ScoringService,
    PitchAnalysisService,
    PronunciationService,
    DurationAnalysisService,
    FeedbackService,
  ],
  exports: [ScoringService],
})
export class ScoringModule {}
