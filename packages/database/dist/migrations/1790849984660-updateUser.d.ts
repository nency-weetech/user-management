import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdateUser1790849984660 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
