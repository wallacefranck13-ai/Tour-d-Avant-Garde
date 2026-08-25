import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  fullName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isIntercessor?: boolean;
}
