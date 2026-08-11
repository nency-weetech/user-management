import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserActivityTable1785407467919 implements MigrationInterface {
    name = 'CreateUserActivityTable1785407467919'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "externalId" integer NOT NULL, "summary" character varying, "url" character varying NOT NULL, "image" character varying, "author" character varying, "language" character varying, "catagory" character varying, "sourceCountry" character varying, "sentiment" numeric(5,3), "publishDated" TIMESTAMP NOT NULL, "lastRefreshedAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_4a861ac377ff8edcd19d26b2695" UNIQUE ("externalId"), CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user', 'manager')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "isActive" boolean NOT NULL DEFAULT true, "isEmailVerified" boolean NOT NULL DEFAULT false, "emailVerificationOtp" character varying, "emailVerificationExpires" TIMESTAMP, "passwordResetOtp" character varying, "resetOtpExpires" TIMESTAMP, "otpAttempts" integer NOT NULL DEFAULT '0', "refreshToken" character varying, "lastLoginAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isPendingDeletion" boolean NOT NULL DEFAULT false, "deletionRequestedAt" TIMESTAMP, "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "articles"`);
    }

}
