import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAndUpdateChatRequireTables1788852282531 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
