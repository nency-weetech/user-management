import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddOrganizationUsage1790141758251 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
