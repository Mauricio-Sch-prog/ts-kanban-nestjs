import { IsNumber, IsUUID, Min } from 'class-validator';

export class MoveLaneDto {
  @IsNumber()
  @Min(0)
  targetIndex!: number;

  @IsUUID()
  targetBoard!: string;
}
