import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdateArticles1785408161054 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
