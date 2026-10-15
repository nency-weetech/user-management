import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreatePlans1790832742551 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
