import { BaseAbstractRepostitory } from '../common/base.repository';
import { Article } from '../entities/article.entity';
import { ArticleInterfaceRepository } from '../interfaces/article.interface';
import { Repository } from 'typeorm';
export declare class ArticleRepository extends BaseAbstractRepostitory<Article> implements ArticleInterfaceRepository {
    private readonly articleRepository;
    constructor(articleRepository: Repository<Article>);
    findByExternalId(externalId: number): Promise<Article | null>;
    upsertArticle(data: Partial<Article>): Promise<Article>;
    findAllPaginated(page: number, limit: number, category?: string): Promise<[Article[], number]>;
    countBySentimentRange(min: number, max: number): Promise<number>;
}
