import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class UpdatePaymentTable1787226295276 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
