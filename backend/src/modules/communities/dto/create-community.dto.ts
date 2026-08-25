import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  timezone?: string;
}
