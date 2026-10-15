import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreatePDFJobs1791191194881 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
