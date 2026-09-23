import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddOrganizationPlan1790140184436 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
