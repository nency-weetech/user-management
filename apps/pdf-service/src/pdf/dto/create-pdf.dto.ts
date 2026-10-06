import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreatePdfDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500_000)
  html!: string;

  @IsOptional()
  @Matches(/^[\w\-. ]{1,64}$/, { message: 'filename has invalid characters' })
  filename?: string;
}