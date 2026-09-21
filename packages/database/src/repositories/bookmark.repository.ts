import { InjectRepository } from '@nestjs/typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { BookMarks } from '../entities/bookmark.entity';
import { IBookmarks } from '../interfaces/bookmark.interface';
import { Repository } from 'typeorm';

export class BookmarkRepository
  extends BaseAbstractRepostitory<BookMarks>
  implements IBookmarks
{
  constructor(
    @InjectRepository(BookMarks)
    private readonly bookmarkrepo: Repository<BookMarks>,
  ) {
    super(bookmarkrepo);
  }

  async findByProfileId(profileId: string): Promise<BookMarks[]> {
    return await this.bookmarkrepo.find({ where: { profile_id: profileId } });
  }

  async findByProfileAndArticle(
    profileId: string,
    articleId: string,
  ): Promise<BookMarks | null> {
    return await this.bookmarkrepo.findOne({
      where: { profile_id: profileId, article_id: articleId },
    });
  }

  async findByOrgAndArticle(
    orgId: string,
    articleId: string,
  ): Promise<BookMarks | null> {
    return await this.bookmarkrepo.findOne({
      where: { organization_id: orgId, article_id: articleId}
    })
  }

  async findOneById(bookmarkId: any): Promise<BookMarks> {
    return await this.bookmarkrepo.findOne({ 
        where: { id: bookmarkId },
        relations : {article: true}
     });
  }

  async findAllBookmark(profileId: string) : Promise<BookMarks[]>{
    return await this.bookmarkrepo.find({ 
        where: {
            profile_id : profileId
        }, 
        relations: {
            article: true
        },
        order:{
            created_at: 'DESC'
        }
    });
  }

  async findAllBookmarkByOrg(orgId: string) : Promise<BookMarks[]>{
    return await this.bookmarkrepo.find({
      where: {
        organization_id: orgId,
      },
      relations: {
        article: true,
        organization: true
      },
      order: {
        created_at: 'DESC'
      }

    })
  }

  async countByProfileId(profileId: string) : Promise<Number>{
    return this.bookmarkrepo.count({where: {profile_id: profileId}})
  }
}
