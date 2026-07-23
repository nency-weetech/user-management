import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email'] as const)) {
    @IsString()
    @IsOptional()
    firstName?: string ;

    @IsString()
    @IsOptional()
    lastName?: string ;
    
}
