import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddBookmarkUsageColumns1789635330959 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
