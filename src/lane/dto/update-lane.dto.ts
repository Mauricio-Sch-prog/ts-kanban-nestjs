import { PartialType } from '@nestjs/mapped-types';
import { CreateLaneDto } from './create-lane.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateLaneDto extends PartialType(CreateLaneDto) {
  @IsOptional()
  @IsUUID()
  board?: string;
}
