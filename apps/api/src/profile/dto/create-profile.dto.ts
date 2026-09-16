import { IsNotEmpty, IsOptional, IsString, } from "class-validator";

export class CreateProfileDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    description?:string;
}
