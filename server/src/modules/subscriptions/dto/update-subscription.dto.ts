import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'EXPIRED', 'CANCELED', 'PENDING'])
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';
}