import { BaseAbstractRepostitory } from '../common/base.repository';
import { NewsFetchLogInterfaceRepo } from '../interfaces/news-fetch-log.interface.repository';
import { NewsFetchLog } from '../entities/news-fetch-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

export class NewsFetchLogRepository
  extends BaseAbstractRepostitory<NewsFetchLog>
  implements NewsFetchLogInterfaceRepo
{
  constructor(
    @InjectRepository(NewsFetchLog)
    private newsFetchLogRepository: Repository<NewsFetchLog>,
  ) {
    super(newsFetchLogRepository);
  }

  async findRecent(limit: number): Promise<NewsFetchLog[]> {
      const log = await this.newsFetchLogRepository.find({
        order: {createdAt : 'DESC'},
        take: limit,
       //relations: {triggeredByUser : true}, -- for all detail of Admin-user
      })
      return log;
  }

  async countFailuersSince(date: Date): Promise<number> {
      return this.newsFetchLogRepository.count({
        where: {success: false, createdAt : MoreThan(date)}
      })
  }

  async getStats(sinceDate: Date) {
    const total = await this.newsFetchLogRepository.count({where: {createdAt : MoreThan(sinceDate)}})
    const failauer = await this.countFailuersSince(sinceDate)
    const avgDuration = await this.newsFetchLogRepository
    .createQueryBuilder('log')
    .select('AVG(log.durationMs)', 'avg')
    .where('log.createdAt > :sinceDate', {sinceDate})
    .getRawOne();

    return {
        TotalFetches : total,
        FailedFetch : failauer,
        SuccessRate : total > 0 ? (((total- failauer)/total) * 100).toFixed(3) : 100,
        AvgDurationMs : (Number(avgDuration?.avg ?? 0)).toFixed(3)
    };
  }
}
