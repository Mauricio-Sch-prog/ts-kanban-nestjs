import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @MinLength(4)
  @MaxLength(100)
  @IsString()
  name?: string;
}
