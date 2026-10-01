import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStatusHistory1786486795451 implements MigrationInterface {
    name = 'AddOrderStatusHistory1786486795451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order_status_history" ("id" int NOT NULL IDENTITY(1,1), "orderId" int NOT NULL, "status" nvarchar(255) CONSTRAINT CHK_f928e2001cb5427284141cc546_ENUM CHECK(status IN ('PENDING_PAYMENT','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED')) NOT NULL, "note" nvarchar(500), "changedByUserId" int, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_2e2727ea7df4a0e880a56bd9c29" DEFAULT getdate(), CONSTRAINT "PK_e6c66d853f155531985fc4f6ec8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_689db3835e5550e68d26ca32676" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_a58d197ebde84d00cdf27ae1844" FOREIGN KEY ("changedByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_a58d197ebde84d00cdf27ae1844"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_689db3835e5550e68d26ca32676"`);
        await queryRunner.query(`DROP TABLE "order_status_history"`);
    }

}
