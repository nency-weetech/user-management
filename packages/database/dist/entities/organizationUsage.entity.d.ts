import { Organizations } from './organization.entity';
export declare class OrganizationUsage {
    id: string;
    organization_id: string;
    organization: Organizations;
    daily_bookmark_count: number;
    daily_bookmark_reset_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
