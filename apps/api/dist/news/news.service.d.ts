import { ArticleRepository } from '@myapp/database';
import { UpdateArticleDto } from './dtos/update-article.dto';
import { Article } from '@myapp/database';
export declare class NewsService {
    private articleRepository;
    constructor(articleRepository: ArticleRepository);
    findAll(page: number, limit: number, category?: string): Promise<{
        data: Article[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPage: number;
        };
    }>;
    remove(id: string): Promise<void>;
    update(id: string, dto: UpdateArticleDto): Promise<Article>;
}
