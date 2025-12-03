import { MigrationInterface, QueryRunner } from "typeorm";

export class ImproveOnPoolFolder1764784616451 implements MigrationInterface {
    name = 'ImproveOnPoolFolder1764784616451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_folder" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pool_folder" ALTER COLUMN "linkCode" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_folder" ALTER COLUMN "linkCode" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pool_folder" ALTER COLUMN "name" SET NOT NULL`);
    }

}
