import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoreSettingsExpansion1786708589786 implements MigrationInterface {
    name = 'AddStoreSettingsExpansion1786708589786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" ADD "deliveryChargeType" nvarchar(255) CONSTRAINT CHK_stores_deliveryChargeType_ENUM CHECK("deliveryChargeType" IN ('FIXED','VARIABLE')) CONSTRAINT "DF_stores_deliveryChargeType" DEFAULT 'FIXED' NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "deliveryChargeAmount" decimal(10,2) CONSTRAINT "DF_stores_deliveryChargeAmount" DEFAULT 0 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "freeDeliveryAboveAmount" decimal(10,2)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "averageDeliveryTime" nvarchar(255) CONSTRAINT CHK_stores_averageDeliveryTime_ENUM CHECK("averageDeliveryTime" IN ('MIN_30_60','HOUR_1_4','HOUR_6_24','DAY_1_3','DAY_3_5','DAY_5_10','DAY_10_PLUS'))`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "storeTimingsJson" nvarchar(MAX)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "taxEnabled" bit CONSTRAINT "DF_stores_taxEnabled" DEFAULT 0 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "taxRatePercent" decimal(5,2)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "taxInclusive" bit CONSTRAINT "DF_stores_taxInclusive" DEFAULT 0 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "returnsEnabled" bit CONSTRAINT "DF_stores_returnsEnabled" DEFAULT 0 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "returnWindowDays" int`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "supportEmail" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "supportPhone" nvarchar(30)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "whatsappNumber" nvarchar(30)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "facebookUrl" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "instagramUrl" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "twitterUrl" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "youtubeUrl" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "seoTitle" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "seoDescription" nvarchar(500)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "seoKeywords" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "notificationEmail" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "notifyNewOrder" bit CONSTRAINT "DF_stores_notifyNewOrder" DEFAULT 1 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "notifyLowStock" bit CONSTRAINT "DF_stores_notifyLowStock" DEFAULT 1 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "notifyCustomerSignup" bit CONSTRAINT "DF_stores_notifyCustomerSignup" DEFAULT 0 NOT NULL`);

        await queryRunner.query(`CREATE TABLE "store_extra_charges" ("id" int NOT NULL IDENTITY(1,1), "storeId" int NOT NULL, "name" nvarchar(100) NOT NULL, "type" nvarchar(255) CONSTRAINT CHK_store_extra_charges_type_ENUM CHECK(type IN ('FIXED','PERCENTAGE')) CONSTRAINT "DF_store_extra_charges_type" DEFAULT 'FIXED' NOT NULL, "amount" decimal(10,2) NOT NULL, "isActive" bit CONSTRAINT "DF_store_extra_charges_isActive" DEFAULT 1 NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_store_extra_charges_createdAt" DEFAULT getdate(), CONSTRAINT "PK_store_extra_charges" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_store_extra_charges_storeId" ON "store_extra_charges" ("storeId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_store_extra_charges_storeId" ON "store_extra_charges"`);
        await queryRunner.query(`DROP TABLE "store_extra_charges"`);

        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "DF_stores_notifyCustomerSignup"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "notifyCustomerSignup"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "DF_stores_notifyLowStock"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "notifyLowStock"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "DF_stores_notifyNewOrder"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "notifyNewOrder"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "notificationEmail"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "seoKeywords"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "seoDescription"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "seoTitle"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "youtubeUrl"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "twitterUrl"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "instagramUrl"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "facebookUrl"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "whatsappNumber"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "supportPhone"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "supportEmail"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "returnWindowDays"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "DF_stores_returnsEnabled"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "returnsEnabled"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "DF_stores_taxInclusive"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "taxInclusive"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "taxRatePercent"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "DF_stores_taxEnabled"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "taxEnabled"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "storeTimingsJson"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT CHK_stores_averageDeliveryTime_ENUM`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "averageDeliveryTime"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "freeDeliveryAboveAmount"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "DF_stores_deliveryChargeAmount"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "deliveryChargeAmount"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "DF_stores_deliveryChargeType"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT CHK_stores_deliveryChargeType_ENUM`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "deliveryChargeType"`);
    }

}
