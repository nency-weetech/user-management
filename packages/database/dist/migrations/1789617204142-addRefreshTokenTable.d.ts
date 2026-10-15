import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddRefreshTokenTable1789617204142 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
