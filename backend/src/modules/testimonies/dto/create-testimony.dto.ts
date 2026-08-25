import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTestimonyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  authorName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  content: string;

  @IsOptional()
  @IsString()
  status?: string;
}
