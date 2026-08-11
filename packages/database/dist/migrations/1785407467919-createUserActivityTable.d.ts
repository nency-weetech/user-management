import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateUserActivityTable1785407467919 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
