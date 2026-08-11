import { BaseAbstractRepostitory } from 'src/common/base.repository';
import { Article } from './entities/article.entity';
import { BaseInterfaceRepository } from 'src/common/base.interface';
import { ArticleInterfaceRepository } from './article.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

export class ArticleRepository
  extends BaseAbstractRepostitory<Article>
  implements ArticleInterfaceRepository
{
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {
    super(articleRepository);
  }

   findByExternalId(externalId: number): Promise<Article | null>{
    return this.articleRepository.findOne({where: {externalId}})
   }

   async upsertArticle(data: Partial<Article>): Promise<Article>{
    await this.articleRepository.upsert(data as any, ['externalId']);
    return this.findByExternalId(data.externalId!) as Promise<Article>;
   }

   async findAllPaginated(page: number, limit: number, category?: string): Promise<[Article[], number]> {
     const skip = (page - 1) * limit;
     const query = this.articleRepository.createQueryBuilder('articles')

     if(category){
      query.andWhere('articles.catagory = :category', {category});
     }

     query.orderBy('articles.publishDated', 'DESC').skip(skip).take(limit);
     return query.getManyAndCount();
   }

   async countBySentimentRange(min: number, max: number): Promise<number> {
     return this.articleRepository.count({
      where: {sentiment: Between(min, max)}
     })
   }
}
