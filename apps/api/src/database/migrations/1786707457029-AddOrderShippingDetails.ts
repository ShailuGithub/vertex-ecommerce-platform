import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderShippingDetails1786707457029 implements MigrationInterface {
    name = 'AddOrderShippingDetails1786707457029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "shippingMethod" nvarchar(255) CONSTRAINT CHK_orders_shippingMethod_ENUM CHECK("shippingMethod" IN ('SELF','COURIER'))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "courierName" nvarchar(100)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "trackingNumber" nvarchar(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "trackingNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "courierName"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT CHK_orders_shippingMethod_ENUM`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shippingMethod"`);
    }

}
