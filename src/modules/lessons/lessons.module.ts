import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { SongsModule } from '../songs/songs.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [SongsModule, ProgressModule],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
