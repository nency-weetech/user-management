import { Injectable } from '@nestjs/common';
import { ArticleRepository } from './article.repository';

@Injectable()
export class NewsService {
  constructor(private articleRepository: ArticleRepository) {}

  async findAll(page: number, limit: number, category?: string) {
    const [items, total] = await this.articleRepository.findAllPaginated(
      page,
      limit,
      category,
    );
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  }
}
