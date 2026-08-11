import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdateArticleAddTitle1785740386616 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
