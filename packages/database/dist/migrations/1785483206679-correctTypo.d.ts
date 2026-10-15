import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CorrectTypo1785483206679 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
