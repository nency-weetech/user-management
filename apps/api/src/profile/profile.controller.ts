import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '@myapp/database';
import { AuthGuard } from '../guards/auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { Response } from 'express';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  create(@Req() req, @Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
    return this.profileService.findAllProfile(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.update(req.user.id, id, updateProfileDto);
  }

  @Post('/setDefault/:id')
  updateIsDefault(@Req() req, @Param('id') id: string) {
    return this.profileService.updateIsDefault(req.user.id, id);
  }

  @Post(':id/activate')
  async activate(@Req() req, @Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const profile = await this.profileService.findOne(id);
    if (profile.user_id !== req.user.id) {
      throw new ForbiddenException();
    }
 
    const newToken = await this.authService.genrateToken(
      req.user.id,
      req.user.email,
      req.user.role,
      id,
    );

    const hashToken = this.authService.hashToken(newToken.refreshToken)
    await this.authService.saveRefreshToken(req.user.id, hashToken);
    res.cookie('accessToken', newToken.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', newToken.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: newToken.accessToken , refreshToken: newToken.refreshToken };
  }
 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }
}
