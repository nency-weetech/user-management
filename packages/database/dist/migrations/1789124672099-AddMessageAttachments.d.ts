import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddMessageAttachments1789124672099 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
