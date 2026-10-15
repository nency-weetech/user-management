import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateArticles1785408161054 implements MigrationInterface {
    name = 'UpdateArticles1785408161054'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "publishDated"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "publishDated" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "lastRefreshedAt"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "lastRefreshedAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "lastRefreshedAt"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "lastRefreshedAt" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "publishDated"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "publishDated" TIMESTAMP NOT NULL`);
    }

}
