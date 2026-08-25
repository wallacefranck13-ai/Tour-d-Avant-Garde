import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SimulateDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  phone: string;

  @IsString()
  @MaxLength(2000)
  text: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;
}
