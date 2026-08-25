import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePrayerRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  authorName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  phone: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  source?: string;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}
