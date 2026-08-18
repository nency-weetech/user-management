import { InjectRepository } from '@nestjs/typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { UserUsage } from '../entities/userUsage.entity';
import { Repository } from 'typeorm';
import { UserUsageInterface } from '../interfaces/userUsage.interface';
import { User } from '../entities/user.entity';

export class UserUsageRepository extends BaseAbstractRepostitory<UserUsage> implements UserUsageInterface{
  constructor(
    @InjectRepository(UserUsage)
    private readonly userUsageRepository: Repository<UserUsage>,
  ) {
    super(userUsageRepository);
  }

  createUsage(userId: string) : Promise<UserUsage>{
    const userUsage = this.userUsageRepository.create({
      userId: userId,
      dailyArticleViewCount: 0,
      dailyArticleViewResetAt: null,
    });
    return this.userUsageRepository.save(userUsage);
  }

  findByUserId(userId: string): Promise<UserUsage | null> {
    return this.userUsageRepository.findOneBy({ userId: userId });
  }

  async incrementViewCount(userId: string, by: number): Promise<void> {
    await this.userUsageRepository.increment(
      { userId },
      'dailyArticleViewCount',
      by,
    );
  }

  async resetDailyCount(userId: string, resetDate: Date): Promise<void> {
    await this.userUsageRepository.update(
      { userId },
      {
        dailyArticleViewCount: 0,
        dailyArticleViewResetAt: resetDate,
      },
    );
  }
}
