import { Organizations } from './organization.entity';
import { User } from './user.entity';
export declare class OrganizationInvite {
    id: string;
    organization_id: string;
    organization: Organizations;
    email: string;
    invited_by: string;
    invited_user: User;
    token: string;
    status: 'pending' | 'accepted';
    expires_at: Date;
    accepted_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
