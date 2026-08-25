import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @IsDateString()
  startAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
