import { IsString, IsNumber, IsArray, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartSessionDto {
  @ApiProperty({ description: 'Song ID to practice' })
  @IsUUID()
  songId: string;
}

export class SubmitAttemptDto {
  @ApiProperty() @IsUUID() sessionId: string;
  @ApiProperty() @IsUUID() lyricLineId: string;
  @ApiProperty() @IsString() transcribedText: string;
  @ApiProperty() @IsNumber() durationMs: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() pitchData?: { time: number; frequency: number }[];
}
