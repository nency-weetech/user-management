import { Profile } from "./profile.entity";
import { Article } from "./article.entity";
import { Organizations } from "./organization.entity";
export declare class BookMarks {
    id: string;
    profile_id: string;
    profile: Profile;
    article_id: string;
    article: Article;
    note?: string;
    organization_id?: string;
    organization?: Organizations;
    created_at: Date;
    updated_at: Date;
}
