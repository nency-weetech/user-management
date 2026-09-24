import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdatePayment1790157317984 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
