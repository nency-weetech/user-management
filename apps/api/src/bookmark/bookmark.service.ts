import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { BookmarkRepository } from '@myapp/database';

@Injectable()
export class BookmarkService {
  constructor(private readonly bookmarkRepo: BookmarkRepository){}

  async create(profileId: string, createBookmarkDto: CreateBookmarkDto) {
      const existBookmark = await this.bookmarkRepo.findByProfileAndArticle(profileId, createBookmarkDto.article_id)
      if(existBookmark){
        throw new ConflictException('Article already bookmarked');
      }

      const bookmark = this.bookmarkRepo.create({
        profile_id: profileId,
        article_id: createBookmarkDto.article_id,
        note: createBookmarkDto.note
      });
      return this.bookmarkRepo.save(bookmark);
  }

  async findAll(profileId: string) {
    return await this.bookmarkRepo.findAllBookmark(profileId);
  }

  async findOne(id: string) {
    return await this.bookmarkRepo.findOneById(id);
  }

  async update(bookmarkId: string, profileId: string, note: string ) {
      const bookmark = await this.bookmarkRepo.findOneById(bookmarkId);
      if(!bookmark){
        throw new NotFoundException('Bookmark not found');
      }

      Object.assign(bookmark, note)
      return this.bookmarkRepo.save(bookmark)
  }

  async remove(bookmarkId: string) {
      const bookmark = await this.bookmarkRepo.findOneById(bookmarkId);
      if(!bookmark){
        throw new NotFoundException('Bookmark not found')
      }

      await this.bookmarkRepo.remove(bookmark)
      return {message : 'Bookmark removed successfull'}
  }

  async checkedBookmark(profileId: string, articleId: string){
    const bookmark = await this.bookmarkRepo.findByProfileAndArticle(profileId, articleId)
    return {
      isBookmarked : !!bookmark,
      bookmark_id : bookmark?.id ?? null
    }
  }
}
