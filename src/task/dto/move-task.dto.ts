import { IsNumber, IsUUID, Min } from 'class-validator';

export class MoveTaskDto {
  @IsNumber()
  @Min(0)
  targetIndex!: number;

  @IsUUID()
  targetLane!: string;
}
