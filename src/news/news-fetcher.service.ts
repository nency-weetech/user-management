import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArticleRepository } from './article.repository';
import { firstValueFrom } from 'rxjs';
import { NewsFetchLogRepository } from './news-fetch-log.repository';
import { fetchTrigger } from './entities/news-fetch-log.entity';

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
    const triggeredBy = triggeredByUserId
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
        if (!article.id || !article.summary || !article.url) continue;
        await this.articalRepository.upsertArticle({
          externalId: article.id,
          summary: article.summary,
          url: article.url,
          image: article.image,
          author: article.author,
          language: article.language,
          catagory: article.category,
          sourceCountry: article.source_country,
          sentiment: article.sentiment,
          publishDated: new Date(article.publish_date),
          lastRefreshedAt: new Date(),
        });
        storedCount++;
      }

      const log = this.newFetchLogRepository.create({
        query,
        articlesFetched: storedCount,
        triggeredBy,
        triggeredByUserId,
        success: true,
        errorMessage: null,
        durationMs: Date.now() - startTime,
      });
      await this.newFetchLogRepository.save(log);

      return { fetched: storedCount };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown Error ';

      const log = this.newFetchLogRepository.create({
        query,
        articlesFetched: 0,
        triggeredBy,
        triggeredByUserId,
        success: false,
        errorMessage: errorMessage,
        durationMs: Date.now() - startTime,
      });
      await this.newFetchLogRepository.save(log);
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        throw new InternalServerErrorException(
          'News API authentication failed — check API key configuration',
        );
      }

      throw new InternalServerErrorException('Failed to fetch news data');
    }
  }
}
