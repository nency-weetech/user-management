import { User } from './user.entity';
export declare class UserUsage {
    id: string;
    user_id: string | null;
    user: User | null;
    daily_article_view_count: Number;
    daily_article_view_reset_at: Date;
    daily_bookmark_count: number;
    daily_bookmark_reset_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
