"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMemberRoleEntity1790059116837 = void 0;
class CreateMemberRoleEntity1790059116837 {
    name = 'CreateMemberRoleEntity1790059116837';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "member_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_member_id" uuid NOT NULL, "role_id" uuid NOT NULL, "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b501a9d44030060f7bf87852d15" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "member_roles" ADD CONSTRAINT "FK_3ca04fbd1f279b3a6c8e4aac990" FOREIGN KEY ("organization_member_id") REFERENCES "organization_members"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_roles" ADD CONSTRAINT "FK_e9080e7a7997a0170026d5139c1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "member_roles" DROP CONSTRAINT "FK_e9080e7a7997a0170026d5139c1"`);
        await queryRunner.query(`ALTER TABLE "member_roles" DROP CONSTRAINT "FK_3ca04fbd1f279b3a6c8e4aac990"`);
        await queryRunner.query(`DROP TABLE "member_roles"`);
    }
}
exports.CreateMemberRoleEntity1790059116837 = CreateMemberRoleEntity1790059116837;
