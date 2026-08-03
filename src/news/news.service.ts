import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleRepository } from './article.repository';
import { UpdateArticleDto } from './dtos/update-article.dto';
import { Article } from './entities/article.entity';

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
