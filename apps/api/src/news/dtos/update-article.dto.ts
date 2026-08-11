import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @ApiPropertyOptional({ example: 'Updated article title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Politics' })
  @IsOptional()
  @IsString()
  catagory?: string;

  @ApiPropertyOptional({ example: 'Updated summary text' })
  @IsOptional()
  @IsString()
  summary?: string;
}
