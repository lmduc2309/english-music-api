import { Module } from '@nestjs/common';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { ScoringService } from '../../services/scoring.service';
import { ProgressHelperService } from '../../services/progress-helper.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PracticeController],
  providers: [PracticeService, ScoringService, ProgressHelperService],
})
export class PracticeModule {}
