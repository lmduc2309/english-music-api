import { IsString, IsUUID, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitScoreDto {
  @ApiProperty({ description: 'ID of the sentence being practiced' })
  @IsUUID()
  sentenceId: string;

  @ApiProperty({ description: 'Speech-to-text recognized text from user' })
  @IsString()
  recognizedText: string;

  @ApiPropertyOptional({ description: 'Pitch data points from user recording' })
  @IsOptional()
  @IsArray()
  userPitchData?: { time: number; frequency: number }[];

  @ApiProperty({ description: 'Duration of user recording in seconds' })
  @IsNumber()
  userDuration: number;
}
