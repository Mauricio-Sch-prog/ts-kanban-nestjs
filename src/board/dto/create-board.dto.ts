import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
} from 'class-validator';
export class CreateBoardDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsNumber()
  positionX!: number;

  @IsOptional()
  @IsNumber()
  positionY!: number;
}
