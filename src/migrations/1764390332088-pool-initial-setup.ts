import { MigrationInterface, QueryRunner } from 'typeorm';

export class PoolInitialSetup1764390332088 implements MigrationInterface {
  name = 'PoolInitialSetup1764390332088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pool_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying NOT NULL, "url" character varying NOT NULL, "size" integer NOT NULL, "aspectRatio" integer NOT NULL, "mimetype" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f46af8e85127cceb2f7e3a7fbf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pool_member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isOwner" boolean NOT NULL DEFAULT false, "invitedAt" TIMESTAMP NOT NULL DEFAULT NOW(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "poolFolderId" uuid, "userId" uuid, CONSTRAINT "PK_3cb44e7780c511cd22021d2d6ad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pool_folder" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(64) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ownerId" uuid, "fileId" uuid, CONSTRAINT "REL_290006a5cbacf2cbc8390b76ff" UNIQUE ("fileId"), CONSTRAINT "PK_e450407e01594cdcfcd96dc7087" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isAnonymous" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_member" ADD CONSTRAINT "FK_ed4f3576c467d2eb1c43a8de503" FOREIGN KEY ("poolFolderId") REFERENCES "pool_folder"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_member" ADD CONSTRAINT "FK_f617580b7822b2ceecd3ad6f915" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_folder" ADD CONSTRAINT "FK_8ba294112c3a8d8c97d96c4084b" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_folder" ADD CONSTRAINT "FK_290006a5cbacf2cbc8390b76ff9" FOREIGN KEY ("fileId") REFERENCES "pool_file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pool_folder" DROP CONSTRAINT "FK_290006a5cbacf2cbc8390b76ff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_folder" DROP CONSTRAINT "FK_8ba294112c3a8d8c97d96c4084b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_member" DROP CONSTRAINT "FK_f617580b7822b2ceecd3ad6f915"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_member" DROP CONSTRAINT "FK_ed4f3576c467d2eb1c43a8de503"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isAnonymous"`);
    await queryRunner.query(`DROP TABLE "pool_folder"`);
    await queryRunner.query(`DROP TABLE "pool_member"`);
    await queryRunner.query(`DROP TABLE "pool_file"`);
  }
}
