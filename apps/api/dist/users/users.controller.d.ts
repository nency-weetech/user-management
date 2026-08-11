import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@myapp/database/';
import { UpdateUserStatusDto } from './dto/update-user-state.dto';
import { GetUserQueryDto } from './dto/get-user-query.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(dto: GetUserQueryDto): Promise<{
        data: User[];
        meta: {
            totalItems: number;
            itemsCount: number;
            itemsPerPage: number;
            totalPage: number;
            currentPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findOne(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto, user: any): Promise<User>;
    updateUserState(userId: string, dto: UpdateUserStatusDto): Promise<{
        message: string;
        userId: string;
        isActice: boolean;
    }>;
}
