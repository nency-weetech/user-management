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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Roles } from 'src/decorators/role.decorator';
import { UserRole } from './enums/user-role.enum';
import { currentUser } from 'src/decorators/current-user.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { UpdateUserStatusDto } from './dto/update-user-state.dto';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { RoleGuard } from 'src/guards/role/role.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN])
  async findAll(@Query() dto: GetUserQueryDto) {
    return this.usersService.findAllPaginated(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @currentUser() user,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Roles([UserRole.ADMIN])
  @Patch(':id/status')
  async updateUserState(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    const updatedUser = await this.usersService.updateUserStatus(userId, dto);
    return {
      message: `User account has been ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully.`,
      userId : updatedUser.id,
      isActice : updatedUser.isActive
    };
  }
}
