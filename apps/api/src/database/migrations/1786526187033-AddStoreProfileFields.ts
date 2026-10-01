import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoreProfileFields1786526187033 implements MigrationInterface {
    name = 'AddStoreProfileFields1786526187033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" ADD "contactEmail" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "contactPhone" nvarchar(30)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "addressLine1" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "addressLine2" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "city" nvarchar(100)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "state" nvarchar(100)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "postalCode" nvarchar(20)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "country" nvarchar(100)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "customDomain" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "checkoutPolicyText" nvarchar(MAX)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "taxPolicyText" nvarchar(MAX)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "returnsPolicyText" nvarchar(MAX)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_stores_customDomain" ON "stores" ("customDomain") WHERE "customDomain" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_stores_customDomain" ON "stores"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "returnsPolicyText"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "taxPolicyText"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "checkoutPolicyText"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "customDomain"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "postalCode"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "addressLine2"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "addressLine1"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "contactPhone"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "contactEmail"`);
    }

}
