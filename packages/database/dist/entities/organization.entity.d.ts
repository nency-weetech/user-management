import { User } from "./user.entity";
export declare class Organizations {
    id: string;
    name: string;
    owner_id: string;
    owner: User;
    is_default: Boolean;
    created_at: Date;
}
