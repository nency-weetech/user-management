import { DeepPartial, Repository } from 'typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { RefreshToken } from '../entities/refreshtoken.entity';
import { IRefreshToken } from '../interfaces/refreshToken.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

export class RefreshTokenRepository
  extends BaseAbstractRepostitory<RefreshToken>
  implements IRefreshToken
{
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshtokenRepo: Repository<RefreshToken>,
  ) {
    super(refreshtokenRepo);
  }

  async createAndSaveToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<RefreshToken> {
    const refreshToken = await this.refreshtokenRepo.create({
      user: { id: userId } as User,
      token_hash: tokenHash,
      expires_at: expiresAt,
      device_info: deviceInfo,
      ip_address: ipAddress,
    });

    return this.refreshtokenRepo.save(refreshToken);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken>{
    return this.refreshtokenRepo.findOne({where: {token_hash: tokenHash}});
  }

  async revoke(id: string): Promise<void>{
    await this.refreshtokenRepo.update(id, {revoked_at: new Date()})
  }

  async revokeAllForUser(userId : string) : Promise<void>{
    await this.refreshtokenRepo.update({user_id : userId}, {revoked_at: new Date()})
  }

}
