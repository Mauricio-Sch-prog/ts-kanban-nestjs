import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
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

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  verificationToken?: string | null;

  @IsOptional()
  @IsDate()
  verificationTokenExpiry?: Date | null;

  @IsOptional()
  @IsString()
  resetPasswordToken?: string | null;

  @IsOptional()
  @IsDate()
  resetPasswordTokenExpiry?: Date | null;

  @IsOptional()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(100)
  @IsString()
  password?: string;
}
