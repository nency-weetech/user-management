import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { AuthGuard } from '../guards/auth/auth.guard';
import { currentUser } from '../decorators/current-user.decorator';
import { User } from '@myapp/database';

@Controller('bookmark')
@UseGuards(AuthGuard)
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}
  
  @Post()
  createPersonalBookmark(@Req() req, @Body() createBookmarkDto: CreateBookmarkDto) {
    return this.bookmarkService.createPersonalBookmark(req.user.profileId, createBookmarkDto, req.user.id);
  }

  @Post(':orgId')
  createOrgBookmark(@Param('orgId') orgId: string, @Req() req, @Body() createBookmarkDto: CreateBookmarkDto) {
    return this.bookmarkService.createOrgBookmark(req.user.profileId, createBookmarkDto, req.user.id, orgId);
  }

  @Get()
  findAll(@Req() req) {
    return this.bookmarkService.findAll(req.user.profileId);
  }

  @Get(':orgId')
  @UseGuards(AuthGuard)
  findAllBookmarkByOrg(@Param('orgId') orgId: string, @Req() req,){
    return this.bookmarkService.findAllByorg(orgId, req.user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookmarkService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') bookmarkId: string, @Req() req, @Body() note: string) {
    return this.bookmarkService.update(bookmarkId, req.user.profileId, note);
  }

  @Delete(':id')
  remove(@Param('id') bookmarkId: string) {
    return this.bookmarkService.remove(bookmarkId);
  }

  @Get('check/:articleId')
  async checkBookmarked(@Req() req, @Param('articleId') articleId: string) {
    return this.bookmarkService.checkedBookmark(req.user.profileId, articleId);
  }

  @Delete(':id/delete')
  @UseGuards(AuthGuard)
  async deleteBookmarkOrg(@Param('id') bookmarkId: string, @currentUser() user: User, @Req() req){
    return this.bookmarkService.deleteBookmark(bookmarkId, user.id, req.user.profileId)
  }

}
