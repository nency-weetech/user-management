import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoomType1789369495806 implements MigrationInterface {
    name = 'AddRoomType1789369495806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."rooms_type_enum" AS ENUM('group', 'direct')`);
        await queryRunner.query(`ALTER TABLE "rooms" ADD "type" "public"."rooms_type_enum" NOT NULL DEFAULT 'direct'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."rooms_type_enum"`);
    }

}
