import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsDateString, IsInt, IsOptional, IsString, Min, MaxLength, MinLength, ValidateNested } from 'class-validator';

export class CreateStepDto {
  @IsInt()
  @Min(1)
  orderIndex: number;

  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class CreatePrayerProgramDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreateStepDto)
  steps?: CreateStepDto[];
}
