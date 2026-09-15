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
      user_id: userId,
      daily_article_view_count: 0,
      daily_article_view_reset_at: null,
    });
    return this.userUsageRepository.save(userUsage);
  }

  findByUserId(userId: string): Promise<UserUsage | null> {
    return this.userUsageRepository.findOneBy({ user_id: userId });
  }

  async incrementViewCount(userId: string, by: number): Promise<void> {
    await this.userUsageRepository.increment(
      { user_id : userId },
      'dailyArticleViewCount',
      by,
    );
  }

  async resetDailyCount(userId: string, resetDate: Date): Promise<void> {
    await this.userUsageRepository.update(
      { user_id: userId },
      {
        daily_article_view_count: 0,
        daily_article_view_reset_at: resetDate,
      },
    );
  }
}
