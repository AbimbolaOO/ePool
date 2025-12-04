import { MigrationInterface, QueryRunner } from "typeorm";

export class AllManyFileCollection1764853386231 implements MigrationInterface {
    name = 'AllManyFileCollection1764853386231'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_folder" DROP CONSTRAINT "FK_290006a5cbacf2cbc8390b76ff9"`);
        await queryRunner.query(`ALTER TABLE "pool_folder" DROP CONSTRAINT "REL_290006a5cbacf2cbc8390b76ff"`);
        await queryRunner.query(`ALTER TABLE "pool_folder" DROP COLUMN "fileId"`);
        await queryRunner.query(`ALTER TABLE "pool_file" DROP CONSTRAINT "FK_661d7be6c652d7070ebc46c55db"`);
        await queryRunner.query(`ALTER TABLE "pool_file" DROP CONSTRAINT "UQ_661d7be6c652d7070ebc46c55db"`);
        await queryRunner.query(`ALTER TABLE "pool_file" ADD CONSTRAINT "FK_661d7be6c652d7070ebc46c55db" FOREIGN KEY ("poolFolderId") REFERENCES "pool_folder"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_file" DROP CONSTRAINT "FK_661d7be6c652d7070ebc46c55db"`);
        await queryRunner.query(`ALTER TABLE "pool_file" ADD CONSTRAINT "UQ_661d7be6c652d7070ebc46c55db" UNIQUE ("poolFolderId")`);
        await queryRunner.query(`ALTER TABLE "pool_file" ADD CONSTRAINT "FK_661d7be6c652d7070ebc46c55db" FOREIGN KEY ("poolFolderId") REFERENCES "pool_folder"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pool_folder" ADD "fileId" uuid`);
        await queryRunner.query(`ALTER TABLE "pool_folder" ADD CONSTRAINT "REL_290006a5cbacf2cbc8390b76ff" UNIQUE ("fileId")`);
        await queryRunner.query(`ALTER TABLE "pool_folder" ADD CONSTRAINT "FK_290006a5cbacf2cbc8390b76ff9" FOREIGN KEY ("fileId") REFERENCES "pool_file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
