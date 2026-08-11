import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@myapp/database/';

import { UserRole } from '@myapp/database';
import { currentUser } from '../decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth/auth.guard';
import { UpdateUserStatusDto } from './dto/update-user-state.dto';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { RoleGuard } from '../guards/role/role.guard';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users (paginated, admin only)' })
  @ApiCookieAuth('accessToken')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Paginated user list returned' })
  @ApiResponse({ status: 403, description: 'Admin role required' })
  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN])
  async findAll(@Query() dto: GetUserQueryDto) {
    return this.usersService.findAllPaginated(dto);
  }

  @ApiOperation({ summary: 'Get single user by id' })
  @ApiCookieAuth('accessToken')
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User Not found' })
  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: "Update a user's profile (self or admin) " })
  @ApiCookieAuth('accessToken')
  @ApiResponse({ status: 200, description: 'User updated sucessfully' })
  @ApiResponse({
    status: 403,
    description: "Can not update another user's prfile unless an admin",
  })
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @currentUser() user,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @ApiOperation({ summary: 'Activate or deactive a user account by admin' })
  @ApiCookieAuth('accessToken')
  @ApiResponse({ status: 200, description: 'User status updated' })
  @ApiResponse({ status: 403, description: 'Admin role requier' })
  @Roles([UserRole.ADMIN])
  @Patch(':id/status')
  async updateUserState(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    const updatedUser = await this.usersService.updateUserStatus(userId, dto);
    return {
      message: `User account has been ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully.`,
      userId: updatedUser.id,
      isActice: updatedUser.isActive,
    };
  }
}
