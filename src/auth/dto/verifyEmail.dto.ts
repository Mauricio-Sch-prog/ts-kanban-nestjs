import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class VerifyEmailDto {
  @Type(() => String)
  @IsString()
  token!: string;

  @Type(() => String)
  @IsString()
  email!: string;
}
