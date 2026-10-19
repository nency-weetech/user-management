export declare const kcConfig: () => {
    url: string;
    realm: string;
    clientId: string;
    clientSecret: string;
    issuer: string;
    tokenUrl: string;
    logoutUrl: string;
    jwksUri: string;
    adminUrl: string;
};
export declare const KC_ACCESS_COOKIE = "kc_access_token";
export declare const KC_REFRESH_COOKIE = "kc_refresh_token";
export declare function decodeJwtPayload(token: string): Record<string, any>;
