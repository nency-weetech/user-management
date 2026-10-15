import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdateArticleTimestamps1785478938370 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
