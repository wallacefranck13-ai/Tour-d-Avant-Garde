import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateActionOfFaithDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  authorName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  description: string;
}
