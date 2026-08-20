import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddPlanInPayment1787202363473 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
