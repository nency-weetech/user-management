import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AnalyticsService {
    constructor(private readonly dataSource : DataSource){}

    async getArticleRelation(){
        const data = await this.dataSource.query(`
            select 
                author_name,    
                catagory,
                related_article_pairs
            from article_relationship_analytics
            order by related_article_pairs desc;
        `)
        return {
            total_data : data.length,
            data
        }
    }

    async refreshArticleRelationship(){
        await this.dataSource.query(`
            REFRESH MATERIALIZED VIEW article_relationship_analytics;    
        `)
        return {
            message : "Article relationship analytics refreshed" 
        }
    }
}
