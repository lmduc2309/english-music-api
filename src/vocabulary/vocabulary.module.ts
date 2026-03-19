import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyItem } from '../entities';
import { VllmModule } from '../vllm/vllm.module';

@Module({
  imports: [TypeOrmModule.forFeature([VocabularyItem]), VllmModule],
  providers: [VocabularyService],
  controllers: [VocabularyController],
  exports: [VocabularyService],
})
export class VocabularyModule {}
