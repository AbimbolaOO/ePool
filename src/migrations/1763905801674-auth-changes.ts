import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthChanges1763905801674 implements MigrationInterface {
  name = 'AuthChanges1763905801674';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "middleName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "archivedAt"`);
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "gender" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "gender" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "archivedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "middleName" character varying NOT NULL`,
    );
  }
}
