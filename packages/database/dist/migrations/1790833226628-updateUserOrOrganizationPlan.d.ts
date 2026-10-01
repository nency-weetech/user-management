import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class UpdateUserOrOrganizationPlan1790833226628 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
