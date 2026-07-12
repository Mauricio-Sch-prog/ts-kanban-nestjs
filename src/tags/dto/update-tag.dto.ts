import { PartialType } from '@nestjs/mapped-types';
import { CreateTagDto } from './create-tag.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateTagDto extends PartialType(CreateTagDto) {
  @IsOptional()
  @IsUUID()
  task?: string;
}
