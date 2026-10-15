import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnName1789548780458 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE articles RENAME COLUMN "updatedAt" TO updated_at`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE articles RENAME COLUMN "updated_at" TO updatedAt`);
    }

}
