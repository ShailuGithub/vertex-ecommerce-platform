import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCoupons1786525512194 implements MigrationInterface {
    name = 'AddCoupons1786525512194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "coupons" ("id" int NOT NULL IDENTITY(1,1), "storeId" int NOT NULL, "code" nvarchar(40) NOT NULL, "type" nvarchar(255) CONSTRAINT CHK_c4653cc5635cd28349c849b932_ENUM CHECK(type IN ('PERCENTAGE','FIXED_AMOUNT')) NOT NULL, "value" decimal(10,2) NOT NULL, "minOrderValue" decimal(10,2), "maxDiscountAmount" decimal(10,2), "usageLimitTotal" int, "usageLimitPerCustomer" int, "startsAt" datetime2, "expiresAt" datetime2, "isActive" bit NOT NULL CONSTRAINT "DF_3650fd30e88e27baa3a88e1e9f9" DEFAULT 1, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_26edbd6ee071c9b03442a6ae71c" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_735b2d1705f774e8cbf3c757b71" DEFAULT getdate(), CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1759bf86967840352d952797ed" ON "coupons" ("storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1cb8eaf46f6b19e9ad3ebea6e5" ON "coupons" ("storeId", "code") `);
        await queryRunner.query(`CREATE TABLE "coupon_redemptions" ("id" int NOT NULL IDENTITY(1,1), "couponId" int NOT NULL, "storeId" int NOT NULL, "customerId" int NOT NULL, "orderId" int NOT NULL, "discountAmount" decimal(10,2) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_1231906f42ba009212c9834fbce" DEFAULT getdate(), CONSTRAINT "PK_5086813ea980d21dbeb190ed0a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_26b8ad24ace2974b2b6c2047d3" ON "coupon_redemptions" ("couponId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_eb006863ca6bbcdeb8ec948ee8" ON "coupon_redemptions" ("orderId") `);
        await queryRunner.query(`ALTER TABLE "orders" ADD "couponCode" nvarchar(40)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "discountAmount" decimal(10,2) NOT NULL CONSTRAINT "DF_103aa231e026ffe2fcf3372faf0" DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "carts" ADD "couponCode" nvarchar(40)`);
        await queryRunner.query(`ALTER TABLE "carts" ADD "discountAmount" decimal(10,2) NOT NULL CONSTRAINT "DF_832fbeff5ecefb6cb6b100bffe5" DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "DF_832fbeff5ecefb6cb6b100bffe5"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "discountAmount"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "couponCode"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_103aa231e026ffe2fcf3372faf0"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "discountAmount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "couponCode"`);
        await queryRunner.query(`DROP INDEX "IDX_eb006863ca6bbcdeb8ec948ee8" ON "coupon_redemptions"`);
        await queryRunner.query(`DROP INDEX "IDX_26b8ad24ace2974b2b6c2047d3" ON "coupon_redemptions"`);
        await queryRunner.query(`DROP TABLE "coupon_redemptions"`);
        await queryRunner.query(`DROP INDEX "IDX_1cb8eaf46f6b19e9ad3ebea6e5" ON "coupons"`);
        await queryRunner.query(`DROP INDEX "IDX_1759bf86967840352d952797ed" ON "coupons"`);
        await queryRunner.query(`DROP TABLE "coupons"`);
    }

}
