import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleRepository, UserPlanEnum, UserPlanRepository, UserUsageRepository } from '@myapp/database';
import { UpdateArticleDto } from './dtos/update-article.dto';
import { Article } from '@myapp/database';

@Injectable()
export class NewsService {
  constructor(private articleRepository: ArticleRepository, private userPlanRepo : UserPlanRepository, private userUsageRepo : UserUsageRepository) {}

  async findAll(userId: string, page: number, limit: number, remainingViewLimit: number | null, category?: string ) {
    const cappedLimit = remainingViewLimit === null ? limit : Math.min(limit, remainingViewLimit)
    const [items, total] = await this.articleRepository.findAllPaginated(
      page,
      cappedLimit,
      category,
    );

    const userPlan = await this.userPlanRepo.findByUserId(userId);
    if(userPlan.plan !== UserPlanEnum.MAX){
      this.userUsageRepo.incrementViewCount(userId, items.length)
    }
    return {
      data: items,
      meta: {
        total,
        page,
        cappedLimit,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  async remove(id: string): Promise<void> {
    const article = await this.articleRepository.findOneById(id);
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    await this.articleRepository.remove(article); 
  }

  async update(id: string, dto: UpdateArticleDto): Promise<Article>{
    const article = await this.articleRepository.findOneById(id)
    if(!article){
      throw new NotFoundException(`Article with ${id} not found`)
    }

    const updated = await this.articleRepository.preload({id, ...dto})
    return this.articleRepository.save(updated!);
  }
}
