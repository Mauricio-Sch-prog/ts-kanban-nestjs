import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateLaneDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsUUID()
  board?: string;
}
