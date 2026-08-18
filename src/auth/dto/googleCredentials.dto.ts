import { IsNotEmpty } from 'class-validator';

export class GoogleCredentialsDto {
  @IsNotEmpty()
  credential!: string;
}
