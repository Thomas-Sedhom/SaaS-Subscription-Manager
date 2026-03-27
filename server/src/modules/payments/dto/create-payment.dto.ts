import { Type } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  subscriptionId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  paymentMethod!: string;

  @IsString()
  provider!: string;
}