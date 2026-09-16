import { User } from "./user.entity";
import { BookMarks } from "./bookmark.entity";
export declare class Profile {
    id: string;
    user_id: string;
    user: User;
    name: string;
    description?: string;
    is_default: boolean;
    bookmarks: BookMarks[];
    created_at: Date;
    updated_at: Date;
}
