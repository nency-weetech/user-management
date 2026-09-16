import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
        @IsString()
        @IsNotEmpty()
        name!: string;
    
        @IsString()
        @IsOptional()
        description?:string;
}
