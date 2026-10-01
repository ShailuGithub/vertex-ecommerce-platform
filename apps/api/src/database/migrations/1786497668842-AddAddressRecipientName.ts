import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddressRecipientName1786497668842 implements MigrationInterface {
    name = 'AddAddressRecipientName1786497668842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ADD "recipientName" nvarchar(150) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "recipientName"`);
    }

}
