import { IsNumber, IsPositive } from 'class-validator';

export class Friends {
  @IsNumber()
  @IsPositive()
  id: number;
}
