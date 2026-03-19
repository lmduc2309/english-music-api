import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'singer@example.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'MyStr0ngP@ss' }) @IsString() @MinLength(6) password: string;
  @ApiProperty({ example: 'John Singer' }) @IsString() @MinLength(2) displayName: string;
  @ApiProperty({ example: 'vi', required: false }) @IsOptional() @IsString() nativeLanguage?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'singer@example.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'MyStr0ngP@ss' }) @IsString() password: string;
}
