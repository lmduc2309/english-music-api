import { IsString, IsArray, IsNumber, IsOptional } from 'class-validator';

export class SubmitAttemptDto {
  @IsString()
  songId: string;

  @IsString()
  sentenceId: string;

  @IsArray()
  @IsNumber({}, { each: true })
  userPitchData: number[];

  @IsNumber()
  userDuration: number;

  @IsArray()
  @IsString({ each: true })
  spokenWords: string[];
}
