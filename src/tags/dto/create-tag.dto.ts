import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsUUID()
  task?: string;
}
