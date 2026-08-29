import { IsNumber, IsUUID } from 'class-validator';

export class MoveLaneDto {
  @IsNumber()
  targetIndex!: number;

  @IsUUID()
  targetBoard!: string;
}
