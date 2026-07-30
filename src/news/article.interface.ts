import { BaseInterfaceRepository } from 'src/common/base.interface';
import { Article } from './entities/article.entity';

export interface ArticleInterfaceRepository extends BaseInterfaceRepository<Article> {
  findByExternalId(externalId: number): Promise<Article | null>;
  upsertArticle(data: Partial<Article>): Promise<Article>;
  findAllPaginated(
    page: number,
    limit: number,
    category?: string,
  ): Promise<[Article[], number]>;
  countBySentimentRange(min: number, max: number): Promise<number>;
}
