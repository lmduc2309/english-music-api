import { Module } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { VllmModule } from '../vllm/vllm.module';

@Module({
  imports: [VllmModule],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
