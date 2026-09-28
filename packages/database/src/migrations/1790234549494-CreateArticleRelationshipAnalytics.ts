import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticleRelationshipAnalytics1790234549494 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE MATERIALIZED VIEW article_relationship_analytics AS
        SELECT
            a1.author_name,
            a1.catagory,
            COUNT(*) AS related_article_pairs
        FROM articles a1
        JOIN articles a2
          ON a1.author_name = a2.author_name
          AND a1.catagory = a2.catagory
          AND a1.id < a2.id
          AND a2.published_date BETWEEN a1.published_date
                                AND a1.published_date + INTERVAL '24 hours'
        GROUP BY
            a1.author_name,
            a1.catagory;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS article_relationship_analytics;`)
  }
}
