import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
export class CreateBoardDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;
}
