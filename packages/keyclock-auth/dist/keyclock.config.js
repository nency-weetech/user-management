"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KC_REFRESH_COOKIE = exports.KC_ACCESS_COOKIE = exports.kcConfig = void 0;
exports.decodeJwtPayload = decodeJwtPayload;
let cached = null;
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv.config({ path: path_1.default.resolve(process.cwd(), '.env') });
function build() {
    const url = process.env.KEYCLOAK_URL ?? 'http://localhost:8180';
    const realm = process.env.KEYCLOAK_REALM ?? 'app';
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
    if (!clientSecret)
        throw new Error('KEYCLOAK_CLIENT_SECRET is not set');
    const base = `${url}/realms/${realm}`;
    return {
        url,
        realm,
        clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'nest-api',
        clientSecret,
        issuer: base,
        tokenUrl: `${base}/protocol/openid-connect/token`,
        logoutUrl: `${base}/protocol/openid-connect/logout`,
        jwksUri: `${base}/protocol/openid-connect/certs`,
        adminUrl: `${url}/admin/realms/${realm}`,
    };
}
// Lazy on purpose: runs after your ConfigModule/dotenv has loaded the env.
const kcConfig = () => (cached ??= build());
exports.kcConfig = kcConfig;
exports.KC_ACCESS_COOKIE = 'kc_access_token';
exports.KC_REFRESH_COOKIE = 'kc_refresh_token';
function decodeJwtPayload(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
}
