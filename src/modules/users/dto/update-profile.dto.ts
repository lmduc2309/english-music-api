import { IsString, IsArray, IsNumber, IsOptional, IsUrl, Min, Max } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsArray()
  preferredGenres?: string[];

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  dailyGoal?: number;
}
