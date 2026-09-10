import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddRoomJoinRequests1788863662853 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
