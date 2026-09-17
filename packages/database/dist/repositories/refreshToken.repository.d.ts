import { Repository } from 'typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { RefreshToken } from '../entities/refreshtoken.entity';
import { IRefreshToken } from '../interfaces/refreshToken.interface';
export declare class RefreshTokenRepository extends BaseAbstractRepostitory<RefreshToken> implements IRefreshToken {
    private readonly refreshtokenRepo;
    constructor(refreshtokenRepo: Repository<RefreshToken>);
    createAndSaveToken(userId: string, tokenHash: string, expiresAt: Date, deviceInfo?: string, ipAddress?: string): Promise<RefreshToken>;
    findByTokenHash(tokenHash: string): Promise<RefreshToken>;
    revoke(id: string): Promise<void>;
    revokeAllForUser(userId: string): Promise<void>;
}
