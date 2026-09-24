import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBookmark1789964991737 implements MigrationInterface {
    name = 'UpdateBookmark1789964991737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookmarks" ADD "organization_id" uuid`);
        await queryRunner.query(`ALTER TABLE "bookmarks" ADD CONSTRAINT "FK_4137fd8ae497e4ac62d049608a8" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookmarks" DROP CONSTRAINT "FK_4137fd8ae497e4ac62d049608a8"`);
        await queryRunner.query(`ALTER TABLE "bookmarks" DROP COLUMN "organization_id"`);
    }

}
