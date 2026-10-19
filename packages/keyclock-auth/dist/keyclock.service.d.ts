export interface KcTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
}
export interface KcCreateUser {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
export declare class KeycloakService {
    private readonly log;
    private adminCache;
    private form;
    private tokenRequest;
    login(email: string, password: string): Promise<KcTokens>;
    refresh(refreshToken: string): Promise<KcTokens>;
    logout(refreshToken: string): Promise<void>;
    private adminToken;
    createUser(dto: KcCreateUser): Promise<string>;
    private assignRealmRole;
}
