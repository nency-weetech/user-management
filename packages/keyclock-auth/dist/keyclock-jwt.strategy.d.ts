export interface KcUser {
    keycloakId: string;
    email?: string;
    roles: string[];
}
declare const KeycloakJwtStrategy_base: new (...args: any) => any;
export declare class KeycloakJwtStrategy extends KeycloakJwtStrategy_base {
    constructor();
    validate(payload: any): KcUser;
}
export {};
