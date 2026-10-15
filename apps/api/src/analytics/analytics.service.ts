import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(private readonly dataSource: DataSource) {}

  async getArticleRelation() {
    const data = await this.dataSource.query(`
            select 
                author_name,    
                catagory,
                related_article_pairs
            from article_relationship_analytics
            order by related_article_pairs desc;
        `);
    return {
      total_data: data.length,
      data,
    };
  }

  async refreshArticleRelationship() {
    await this.dataSource.query(`
            REFRESH MATERIALIZED VIEW article_relationship_analytics;    
        `);
    return {
      message: 'Article relationship analytics refreshed',
    };
  }

  async refreshSalesSummary() {
    await this.dataSource.query(`
            REFRESH MATERIALIZED VIEW sales_summary_mv;    
        `);
    return {
      message: 'Sales summary page refreshed',
    };
  }

  async getSalesSummary(
    plan?: string,
    targetType?: string,
    fromDate?: string,
    toDate?: string,
  ) {
    const conditions: string[] = [];
    const params: any[] = [];

    if (plan) {
      params.push(plan);
      conditions.push(`plan = $${params.length}`);
    }

    if (targetType) {
      params.push(targetType);
      conditions.push(`target_type = $${params.length}`);
    }

    if (fromDate) {
      params.push(fromDate);
      conditions.push(`sale_date >= $${params.length}`);
    }

    if (toDate) {
      params.push(toDate);
      conditions.push(`sale_date <= $${params.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const data = await this.dataSource.query(
      `
            select 
                sale_date,
                plan,
                target_type,
                total_sales,
                subscriber_count
            from sales_summary_mv
            ${whereClause}
            order by sale_date desc
        `,
      params,
    );

    const totalSales = data.reduce(
      (sum: number, row: any) => sum + Number(row.total_sales),
      0,
    );

    return {
      total: data.length,
      totalSales,
      data,
    };
  }
}
