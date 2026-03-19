import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { VocabularyService } from './vocabulary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';

class AddWordDto {
  @ApiProperty() @IsString() word: string;
  @ApiProperty() @IsString() songContext: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() songId?: string;
}

class ReviewWordDto {
  @ApiProperty({ minimum: 0, maximum: 5 }) @IsNumber() @Min(0) @Max(5) quality: number;
}

@ApiTags('Vocabulary') @Controller('vocabulary') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
export class VocabularyController {
  constructor(private svc: VocabularyService) {}

  @Post('add') @ApiOperation({ summary: 'Add a word to vocabulary' })
  addWord(@Request() req: any, @Body() dto: AddWordDto) {
    return this.svc.addWord(req.user.id, dto.word, dto.songContext, dto.songId);
  }

  @Get('review') @ApiOperation({ summary: 'Get words due for review' })
  getReview(@Request() req: any, @Query('limit') limit?: number) {
    return this.svc.getReviewWords(req.user.id, limit || 10);
  }

  @Post(':wordId/review') @ApiOperation({ summary: 'Submit review result (SM-2)' })
  review(@Request() req: any, @Param('wordId') id: string, @Body() dto: ReviewWordDto) {
    return this.svc.reviewWord(req.user.id, id, dto.quality);
  }

  @Get() @ApiOperation({ summary: 'Get user vocabulary list' })
  getVocab(@Request() req: any, @Query('page') page?: number) {
    return this.svc.getUserVocabulary(req.user.id, page || 1);
  }
}
