import { MigrationInterface, QueryRunner } from "typeorm";

export class AddkeycloakIdInUser1786187184270 implements MigrationInterface {
    name = 'AddkeycloakIdInUser1786187184270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "keycloakId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "keycloakId"`);
    }

}
