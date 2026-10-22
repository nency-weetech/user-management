import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class OutboxTable1792403231090 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
