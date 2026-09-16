import { BaseAbstractRepostitory } from '../common/base.repository';
import { BookMarks } from '../entities/bookmark.entity';
import { IBookmarks } from '../interfaces/bookmark.interface';
import { Repository } from 'typeorm';
export declare class BookmarkRepository extends BaseAbstractRepostitory<BookMarks> implements IBookmarks {
    private readonly bookmarkrepo;
    constructor(bookmarkrepo: Repository<BookMarks>);
    findByProfileId(profileId: string): Promise<BookMarks[]>;
    findByProfileAndArticle(profileId: string, articleId: string): Promise<BookMarks | null>;
    findOneById(bookmarkId: any): Promise<BookMarks>;
    findAllBookmark(profileId: string): Promise<BookMarks[]>;
}
