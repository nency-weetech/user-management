import { User } from "./user.entity";
export declare class UserUsage {
    id: string;
    userId: string | null;
    user: User | null;
    dailyArticleViewCount: Number;
    dailyArticleViewResetAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
