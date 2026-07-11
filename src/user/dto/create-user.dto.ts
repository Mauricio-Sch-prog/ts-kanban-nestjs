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

  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(100)
  @IsString()
  password!: string;

  @IsOptional()
  @MinLength(4)
  @MaxLength(100)
  @IsString()
  name?: string;
}
