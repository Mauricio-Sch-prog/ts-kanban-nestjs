import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  title?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(600)
  description?: string;

  @IsUUID()
  lane?: string;
}
