import { Profile } from "./profile.entity";
import { Article } from "./article.entity";
export declare class BookMarks {
    id: string;
    profile_id: string;
    profile: Profile;
    article_id: string;
    article: Article;
    note?: string;
    created_at: Date;
    updated_at: Date;
}
