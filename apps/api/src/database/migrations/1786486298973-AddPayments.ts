import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPayments1786486298973 implements MigrationInterface {
    name = 'AddPayments1786486298973'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payments" ("id" int NOT NULL IDENTITY(1,1), "storeId" int NOT NULL, "orderId" int NOT NULL, "razorpayOrderId" nvarchar(100) NOT NULL, "razorpayPaymentId" nvarchar(100), "razorpaySignature" nvarchar(255), "amount" decimal(10,2) NOT NULL, "currency" nvarchar(10) NOT NULL CONSTRAINT "DF_eb4f745ec0ac3b18b42eff773fa" DEFAULT 'INR', "status" nvarchar(255) CONSTRAINT CHK_b415aecb341429237f3c8f9880_ENUM CHECK(status IN ('CREATED','AUTHORIZED','CAPTURED','FAILED','REFUNDED')) NOT NULL CONSTRAINT "DF_32b41cdb985a296213e9a928b50" DEFAULT 'CREATED', "method" nvarchar(50), "rawResponse" ntext, "webhookVerifiedAt" datetime2, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_8277a466232344577740a613449" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_f31d7fb345aead5b86642b75522" DEFAULT getdate(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5c888566214b5fa4da01bcc927" ON "payments" ("storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0d65ce2454954e71c67ea424c4" ON "payments" ("razorpayOrderId") `);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1"`);
        await queryRunner.query(`DROP INDEX "IDX_0d65ce2454954e71c67ea424c4" ON "payments"`);
        await queryRunner.query(`DROP INDEX "IDX_5c888566214b5fa4da01bcc927" ON "payments"`);
        await queryRunner.query(`DROP TABLE "payments"`);
    }

}
