import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArticleRepository } from '@myapp/database';
import { firstValueFrom } from 'rxjs';
import { NewsFetchLogRepository } from '@myapp/database';
import { fetchTrigger } from '@myapp/database';
import { title } from 'process';

@Injectable()
export class NewsFetcherService {
  constructor(
    private httpService: HttpService,
    private config: ConfigService,
    private articalRepository: ArticleRepository,
    private newFetchLogRepository: NewsFetchLogRepository,
  ) {}

  async fetchAndStoreNews(
    query: string,
    number: number,
    triggeredByUserId: string | null = null,
  ): Promise<{ fetched: number }> {
    const startTime = Date.now();
    const triggeredType = triggeredByUserId
      ? fetchTrigger.ADMIN
      : fetchTrigger.CORN;

    try {
      const apikey = await this.config.get('WORLD_NEWS_API_KEY');
      const apiurl = await this.config.get('WORLD_NEWS_API_URL');

      const response = await firstValueFrom(
        this.httpService.get(apiurl, {
          params: { text: query, language: 'en', number: number },
          headers: { 'x-api-key': apikey },
        }),
      );

      const articles = response.data.news;
      let storedCount = 0;

      for (const article of articles) {
        if (!article.id || !article.title || !article.url) continue;
        await this.articalRepository.upsertArticle({
          external_id: article.id,
          title : article.title,
          summary: article.summary,
          url: article.url,
          image: article.image,
          author_name: article.author,
          language: article.language,
          catagory: article.category,
          source_country: article.source_country,
          sentiment: article.sentiment,
          published_date: new Date(article.publish_date),
          last_refreshed_at: new Date(),
        });
        storedCount++;
      }

      const log = this.newFetchLogRepository.create({
        query,
        articles_fetched: storedCount,
        trigger_type: triggeredType,
        triggered_by_user_id : triggeredByUserId,
        success: true,
        error_message: null,
        duration_ms: Date.now() - startTime,
      });
      await this.newFetchLogRepository.save(log);

      return { fetched: storedCount };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown Error ';

      const log = this.newFetchLogRepository.create({
        query,
        articles_fetched: 0,
        trigger_type: triggeredType,
        triggered_by_user_id : triggeredByUserId,
        success: false,
        error_message: errorMessage,
        duration_ms: Date.now() - startTime,
      });
      await this.newFetchLogRepository.save(log);
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        throw new InternalServerErrorException(
          'News API authentication failed - check API Key configuration',
        );
      }
      if (errorMessage.includes('429')) {
        throw new InternalServerErrorException(
          'News API rate limit exceeded - Wait and retry later',
        );
      }
      if (
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ETIMEOUT')
      ) {
        throw new InternalServerErrorException(
          'Could not connect to News API - network or server issue',
        );
      }

      throw new InternalServerErrorException(`Failed to fetch news data : ${errorMessage}`);
    }
  }
}
