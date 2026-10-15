import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateNewTables1787027075564 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
