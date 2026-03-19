import { IsString, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CefrLevel } from '../../entities';

export class LyricLineDto {
  @ApiProperty() @IsInt() @Min(1) lineNumber: number;
  @ApiProperty() @IsString() text: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phonetic?: string;
  @ApiProperty() @IsNumber() startTime: number;
  @ApiProperty() @IsNumber() endTime: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() keywords?: string[];
}

export class CreateSongDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() artist: string;
  @ApiProperty() @IsString() youtubeVideoId: string;
  @ApiProperty({ enum: CefrLevel }) @IsEnum(CefrLevel) level: CefrLevel;
  @ApiPropertyOptional() @IsOptional() @IsString() genre?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() bpm?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiProperty({ type: [LyricLineDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => LyricLineDto) lyrics: LyricLineDto[];
}

export class SongQueryDto {
  @ApiPropertyOptional({ enum: CefrLevel }) @IsOptional() @IsEnum(CefrLevel) level?: CefrLevel;
  @ApiPropertyOptional() @IsOptional() @IsString() genre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 20;
}
