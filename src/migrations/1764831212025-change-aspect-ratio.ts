import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAspectRatio1764831212025 implements MigrationInterface {
  name = 'ChangeAspectRatio1764831212025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pool_file" DROP COLUMN "aspectRatio"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_file" ADD "aspectRatioW" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_file" ADD "aspectRatioH" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pool_file" DROP COLUMN "aspectRatioH"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_file" DROP COLUMN "aspectRatioW"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pool_file" ADD "aspectRatio" integer NOT NULL`,
    );
  }
}
