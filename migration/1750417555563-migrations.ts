import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750417555563 implements MigrationInterface {
    name = 'Migrations1750417555563'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."contact_linkprecedence_enum" AS ENUM('primary', 'secondary')`);
        await queryRunner.query(`CREATE TABLE "contact" ("id" SERIAL NOT NULL, "phoneNumber" character varying, "email" character varying, "linkedId" integer, "linkPrecedence" "public"."contact_linkprecedence_enum" NOT NULL DEFAULT 'primary', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_2cbbe00f59ab6b3bb5b8d19f989" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "contact" ADD CONSTRAINT "FK_860a3f5d23b62cc0f1a2297a1ea" FOREIGN KEY ("linkedId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contact" DROP CONSTRAINT "FK_860a3f5d23b62cc0f1a2297a1ea"`);
        await queryRunner.query(`DROP TABLE "contact"`);
        await queryRunner.query(`DROP TYPE "public"."contact_linkprecedence_enum"`);
    }

}
