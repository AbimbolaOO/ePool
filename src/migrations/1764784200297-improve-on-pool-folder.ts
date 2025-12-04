import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImproveOnPoolFolder1764784200297 implements MigrationInterface {
  name = 'ImproveOnPoolFolder1764784200297';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pool_folder" ADD "linkCode" character varying(4) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_folder" ADD "linkGeneratedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pool_folder" DROP COLUMN "linkGeneratedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "pool_folder" DROP COLUMN "linkCode"`);
  }
}
