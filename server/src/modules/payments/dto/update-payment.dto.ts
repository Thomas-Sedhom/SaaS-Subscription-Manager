import { IsIn, IsOptional } from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @IsIn(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'])
  status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
}