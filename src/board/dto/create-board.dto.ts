import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
  IsUUID,
} from 'class-validator';
export class CreateBoardDto {
  @IsOptional()
  @IsUUID()
  id?: string;

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

  @IsOptional()
  @IsNumber()
  width!: number;
}
