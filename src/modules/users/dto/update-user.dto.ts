import { IsOptional, IsString, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  preferences?: {
    nativeLanguage?: string;
    dailyGoalMinutes?: number;
    preferredGenres?: string[];
    notificationsEnabled?: boolean;
  };
}
