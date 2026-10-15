import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNewsFetchLog1790572320783 implements MigrationInterface {
    name = 'UpdateNewsFetchLog1790572320783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" DROP CONSTRAINT "FK_51fe272002e1ff7f853a29ec3b7"`);
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" ADD CONSTRAINT "FK_1e998f2fe8297666eba2944eb44" FOREIGN KEY ("triggered_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" DROP CONSTRAINT "FK_1e998f2fe8297666eba2944eb44"`);
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" ADD CONSTRAINT "FK_51fe272002e1ff7f853a29ec3b7" FOREIGN KEY ("triggered_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
