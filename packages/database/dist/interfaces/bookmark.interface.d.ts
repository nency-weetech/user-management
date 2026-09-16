import { BaseInterfaceRepository } from "../common/base.interface";
import { BookMarks } from "../entities/bookmark.entity";
export interface IBookmarks extends BaseInterfaceRepository<BookMarks> {
    findByProfileId(profileId: string): Promise<BookMarks[]>;
    findByProfileAndArticle(profileId: string, articleId: string): Promise<BookMarks | null>;
}
