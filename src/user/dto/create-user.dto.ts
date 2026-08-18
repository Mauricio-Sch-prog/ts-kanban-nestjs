import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(100)
  @IsString()
  password?: string;

  @IsOptional()
  @MinLength(4)
  @MaxLength(100)
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string | undefined;
}
