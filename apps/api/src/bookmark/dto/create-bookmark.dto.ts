
import { IsNotEmpty, IsOptional, IsString, } from "class-validator";

export class CreateBookmarkDto {
    @IsString()
    @IsNotEmpty()
    article_id!: string;

    @IsString()
    @IsOptional()
    note?:string;
}
