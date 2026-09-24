import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddPermissionRoleTables1789989151583 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
