import { User } from './user.entity';
export declare enum fetchTrigger {
    CORN = "corn",
    ADMIN = "admin"
}
export declare class NewsFetchLog {
    id: string;
    query: string;
    articlesFetched: number;
    triggeredBy: fetchTrigger;
    triggeredByUserId: string | null;
    triggeredByUser: User | null;
    success: boolean;
    errorMessage: string | null;
    durationMs: number;
    createdAt: Date;
    updatedAt: Date;
}
