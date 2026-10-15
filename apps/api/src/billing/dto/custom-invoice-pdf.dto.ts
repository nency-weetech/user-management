import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CustomInvoicePdfDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  companyName?: string;

  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'brandColor must look like #RRGGBB' })
  brandColor?: string;
}