import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdateBookmark1789964991737 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
