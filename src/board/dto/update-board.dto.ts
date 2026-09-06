import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardDto } from './create-board.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  @IsOptional()
  @IsNumber()
  @Min(200)
  width?: number;
}
