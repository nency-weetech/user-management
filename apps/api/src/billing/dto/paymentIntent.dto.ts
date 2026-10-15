import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PaymentIntentDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  discountCode?: string;
}