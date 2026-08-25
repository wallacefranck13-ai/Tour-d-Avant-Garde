import { IsInt, IsOptional, IsString, Min, MaxLength, MinLength } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetParticipants?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentParticipants?: number;
}
