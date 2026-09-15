import { User } from './user.entity';
export declare enum fetchTrigger {
    CORN = "corn",
    ADMIN = "admin"
}
export declare class NewsFetchLog {
    id: string;
    query: string;
    articles_fetched: number;
    trigger_type: fetchTrigger;
    triggered_by_user_id: string | null;
    triggered_by_user: User | null;
    success: boolean;
    error_message: string | null;
    duration_ms: number;
    created_at: Date;
    updated_at: Date;
}
