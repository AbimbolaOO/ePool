import { MigrationInterface, QueryRunner } from "typeorm";

export class FolderJoinColumn1764849458319 implements MigrationInterface {
    name = 'FolderJoinColumn1764849458319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_file" ADD "poolFolderId" uuid`);
        await queryRunner.query(`ALTER TABLE "pool_file" ADD CONSTRAINT "UQ_661d7be6c652d7070ebc46c55db" UNIQUE ("poolFolderId")`);
        await queryRunner.query(`ALTER TABLE "pool_file" ADD CONSTRAINT "FK_661d7be6c652d7070ebc46c55db" FOREIGN KEY ("poolFolderId") REFERENCES "pool_folder"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_file" DROP CONSTRAINT "FK_661d7be6c652d7070ebc46c55db"`);
        await queryRunner.query(`ALTER TABLE "pool_file" DROP CONSTRAINT "UQ_661d7be6c652d7070ebc46c55db"`);
        await queryRunner.query(`ALTER TABLE "pool_file" DROP COLUMN "poolFolderId"`);
    }

}
