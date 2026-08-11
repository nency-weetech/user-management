import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateArticleAddTitle1785740386616 implements MigrationInterface {
    name = 'UpdateArticleAddTitle1785740386616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ADD "title" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "title"`);
    }

}
