import { IsOptional, IsString } from "class-validator";

export class UpdateArticleDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    catagory ?: string;

    @IsOptional()
    @IsString()
    summary?: string
}