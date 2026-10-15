import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { UserRole } from "@myapp/database";
import { ApiProperty } from "@nestjs/swagger";

export class GetUserQueryDto {
    @ApiProperty({ example: 1 })
    @IsOptional()
    @Type(()=> Number)
    @IsInt()
    @Min(1)
    page:number = 1;

    @ApiProperty({ example: 10 })
    @IsOptional()
    @Type(()=> Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit:number = 10;

    @ApiProperty({ example: 'john' })
    @IsOptional()
    @IsString()
    search ? : string;

    @ApiProperty({ example: 'user' })
    @IsOptional()
    @IsEnum(UserRole)
    role ?: UserRole;

    @ApiProperty({ example: true })
    @IsOptional()
    @Transform(({value}) => value === 'true' || value === true)
    @IsBoolean()
    isActive ?: boolean
}