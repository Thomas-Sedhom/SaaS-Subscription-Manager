import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

import { CreatePaymentMethodDto } from '../../payment-methods/dto/create-payment-method.dto';

export class ChangePlanDto {
  @IsString()
  newPlanId!: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePaymentMethodDto)
  newPaymentMethod?: CreatePaymentMethodDto;

  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;
}