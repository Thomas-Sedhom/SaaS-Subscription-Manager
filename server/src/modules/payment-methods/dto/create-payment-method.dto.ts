import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength
} from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  @MinLength(12)
  @Matches(/^[\d\s]+$/, {
    message: 'cardNumber must contain only digits and spaces'
  })
  cardNumber!: string;

  @IsString()
  @MinLength(2)
  cardholderName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  expiryMonth!: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(9999)
  expiryYear!: number;

  @IsString()
  @Matches(/^\d{3,4}$/, {
    message: 'cvv must be 3 or 4 digits'
  })
  cvv!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  saveForFuture?: boolean;
}
