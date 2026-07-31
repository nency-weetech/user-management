import { BaseAbstractRepostitory } from 'src/common/base.repository';
import { NewsFetchLogInterfaceRepo } from './news-fetch-log.interface.repository';
import { NewsFetchLog } from './entities/news-fetch-log.entity';
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
}
