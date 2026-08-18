import { ArticleRepository, UserPlanRepository, UserUsageRepository } from '@myapp/database';
import { UpdateArticleDto } from './dtos/update-article.dto';
import { Article } from '@myapp/database';
export declare class NewsService {
    private articleRepository;
    private userPlanRepo;
    private userUsageRepo;
    constructor(articleRepository: ArticleRepository, userPlanRepo: UserPlanRepository, userUsageRepo: UserUsageRepository);
    findAll(userId: string, page: number, limit: number, category?: string): Promise<{
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
//# sourceMappingURL=news.service.d.ts.map