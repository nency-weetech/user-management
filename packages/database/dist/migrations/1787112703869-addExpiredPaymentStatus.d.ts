import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddExpiredPaymentStatus1787112703869 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
