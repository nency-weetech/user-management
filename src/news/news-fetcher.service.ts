import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArticleRepository } from './article.repository';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NewsFetcherService {
  constructor(
    private httpService: HttpService,
    private config: ConfigService,
    private articalRepository: ArticleRepository,
  ) {}

  async fetchAndStoreNews(
    query: string,
    number: number,
  ): Promise<{ fetched: number }> {
    const apikey = await this.config.get('WORLD_NEWS_API_KEY');
    const apiurl = await this.config.get('WORLD_NEWS_API_URL');

    const response = await firstValueFrom(
      this.httpService.get(apiurl, {
        params: { text: query, language: 'en', number: number },
        headers: { 'x-api-key': apikey },
      }),
    );

    const articles = response.data.news;

    for (const article of articles) {
      await this.articalRepository.upsertArticle({
        externalId: article.id,
        summary: article.summary,
        url: article.url,
        image: article.image ,
        author: article.author ,
        language: article.language ,
        catagory: article.catagory ,
        sourceCountry: article.sourceCountry ,
        sentiment: article.sentiment ,
        publishDated: new Date(article.publish_date),
        lastRefreshedAt: new Date(),
      });
    }
    return { fetched: articles.length };
  }
}
