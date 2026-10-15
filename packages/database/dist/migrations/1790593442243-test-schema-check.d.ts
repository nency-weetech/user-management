import { MigrationInterface, QueryRunner } from "typeorm";
export declare class TestSchemaCheck1790593442243 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
