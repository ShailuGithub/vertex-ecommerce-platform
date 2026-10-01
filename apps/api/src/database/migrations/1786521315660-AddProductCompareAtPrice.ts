import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductCompareAtPrice1786521315660 implements MigrationInterface {
    name = 'AddProductCompareAtPrice1786521315660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "compareAtPrice" decimal(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "compareAtPrice"`);
    }

}
