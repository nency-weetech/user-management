import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateArticleTimestamps1785478938370 implements MigrationInterface {
    name = 'UpdateArticleTimestamps1785478938370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "createdAt"`);
    }

}
