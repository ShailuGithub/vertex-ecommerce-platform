import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMultiTenant1786467248427 implements MigrationInterface {
    name = 'InitMultiTenant1786467248427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" int NOT NULL IDENTITY(1,1), "email" nvarchar(255) NOT NULL, "passwordHash" nvarchar(255) NOT NULL, "firstName" nvarchar(100) NOT NULL, "lastName" nvarchar(100) NOT NULL, "phone" nvarchar(30), "role" nvarchar(255) CONSTRAINT CHK_9d4a3f66d2c9a6a12d1a214f23_ENUM CHECK(role IN ('PLATFORM_ADMIN','STORE_OWNER','STORE_STAFF')) NOT NULL, "storeId" int, "isActive" bit NOT NULL CONSTRAINT "DF_409a0298fdd86a6495e23c25c66" DEFAULT 1, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_204e9b624861ff4a5b268192101" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_0f5cbe00928ba4489cc7312573b" DEFAULT getdate(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_c82cd4fa8f0ac4a74328abe997" ON "users" ("storeId") `);
        await queryRunner.query(`CREATE TABLE "addresses" ("id" int NOT NULL IDENTITY(1,1), "customerId" int NOT NULL, "label" nvarchar(50), "line1" nvarchar(255) NOT NULL, "line2" nvarchar(255), "city" nvarchar(100) NOT NULL, "state" nvarchar(100) NOT NULL, "postalCode" nvarchar(20) NOT NULL, "country" nvarchar(100) NOT NULL CONSTRAINT "DF_35936c20d74117b96ca37c06dbf" DEFAULT 'India', "phone" nvarchar(30), "isDefault" bit NOT NULL CONSTRAINT "DF_1eddd7727ca6a46f1c59deaaad8" DEFAULT 0, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_f6e5f4475d8f29a62cbeb7cf40b" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_0ac98eed930e741a0c38e3b8717" DEFAULT getdate(), CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" int NOT NULL IDENTITY(1,1), "storeId" int NOT NULL, "email" nvarchar(255) NOT NULL, "passwordHash" nvarchar(255) NOT NULL, "firstName" nvarchar(100) NOT NULL, "lastName" nvarchar(100) NOT NULL, "phone" nvarchar(30), "isActive" bit NOT NULL CONSTRAINT "DF_40946e98ab87148f58703fa1c51" DEFAULT 1, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_2cf358083303634803f1dfb763b" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_d9a71b3a15d5868e0886669654e" DEFAULT getdate(), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3601141586fbfaa357fc6986b6" ON "customers" ("storeId", "email") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" int NOT NULL IDENTITY(1,1), "storeId" int NOT NULL, "name" nvarchar(150) NOT NULL, "slug" nvarchar(160) NOT NULL, "description" nvarchar(1000), "imageUrl" nvarchar(500), "parentId" int, "isActive" bit NOT NULL CONSTRAINT "DF_77d4cad977bd471fb6700595618" DEFAULT 1, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_43bf08375ae7bfae7d55bc3a0cc" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_12ab873251814ad54ddb41d45e4" DEFAULT getdate(), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fa6ba3528de12e174b163c09fd" ON "categories" ("storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4dc2021f63ca35ec7905cb2fd2" ON "categories" ("storeId", "slug") `);
        await queryRunner.query(`CREATE TABLE "products" ("id" int NOT NULL IDENTITY(1,1), "storeId" int NOT NULL, "name" nvarchar(200) NOT NULL, "slug" nvarchar(220) NOT NULL, "description" nvarchar(4000) NOT NULL CONSTRAINT "DF_433f0ea20c848a3c0421c7d2453" DEFAULT '', "basePrice" decimal(10,2) NOT NULL, "categoryId" int NOT NULL, "brand" nvarchar(150), "isActive" bit NOT NULL CONSTRAINT "DF_ff39b9ac40872b2de41751eedc0" DEFAULT 1, "metaTitle" nvarchar(200), "metaDescription" nvarchar(500), "createdAt" datetime2 NOT NULL CONSTRAINT "DF_63fcb3d8806a6efd53dbc674309" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_51287e43b0bd3e113a1ead339c1" DEFAULT getdate(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_782da5e50e94b763eb63225d69" ON "products" ("storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9844b96a2b5b3620eee675f805" ON "products" ("storeId", "slug") `);
        await queryRunner.query(`CREATE TABLE "product_images" ("id" int NOT NULL IDENTITY(1,1), "variantId" int NOT NULL, "url" nvarchar(500) NOT NULL, "altText" nvarchar(200), "sortOrder" int NOT NULL CONSTRAINT "DF_ee25a1e373461023f7ef5faf14f" DEFAULT 0, "isPrimary" bit NOT NULL CONSTRAINT "DF_0e608cfeddd2708513ff81b73dc" DEFAULT 0, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_feaecd4f6495ea14e40118bc050" DEFAULT getdate(), CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inventory" ("id" int NOT NULL IDENTITY(1,1), "variantId" int NOT NULL, "quantityOnHand" int NOT NULL CONSTRAINT "DF_e7c66ce4154406b7132ad0430b5" DEFAULT 0, "quantityReserved" int NOT NULL CONSTRAINT "DF_e07aa0abf0a51d0fd8444f4c485" DEFAULT 0, "lowStockThreshold" int NOT NULL CONSTRAINT "DF_b17abc297aa229f09686abc94ac" DEFAULT 5, "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_9a6968927219fb4982745dd3443" DEFAULT getdate(), CONSTRAINT "UQ_c543b38cb9c82610bd0848862f4" UNIQUE ("variantId"), CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_c543b38cb9c82610bd0848862f" ON "inventory" ("variantId") WHERE "variantId" IS NOT NULL`);
        await queryRunner.query(`CREATE TABLE "product_variants" ("id" int NOT NULL IDENTITY(1,1), "productId" int NOT NULL, "sku" nvarchar(100) NOT NULL, "attributes" ntext NOT NULL, "price" decimal(10,2), "isActive" bit NOT NULL CONSTRAINT "DF_74f84d49e67995a1e46c402eabc" DEFAULT 1, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_67f5b0b3d9deaedc052e3fdf98d" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_907e54789fa1a148436444f6aa2" DEFAULT getdate(), CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" int NOT NULL IDENTITY(1,1), "orderId" int NOT NULL, "variantId" int NOT NULL, "productNameSnapshot" nvarchar(200) NOT NULL, "skuSnapshot" nvarchar(100) NOT NULL, "unitPrice" decimal(10,2) NOT NULL, "quantity" int NOT NULL, "lineTotal" decimal(10,2) NOT NULL, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" int NOT NULL IDENTITY(1,1), "storeId" int NOT NULL, "orderNumber" nvarchar(30) NOT NULL, "customerId" int NOT NULL, "status" nvarchar(255) CONSTRAINT CHK_a14eb74e0a9f67e778f30abf72_ENUM CHECK(status IN ('PENDING_PAYMENT','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED')) NOT NULL CONSTRAINT "DF_775c9f06fc27ae3ff8fb26f2c47" DEFAULT 'PENDING_PAYMENT', "subtotal" decimal(10,2) NOT NULL, "shippingCost" decimal(10,2) NOT NULL CONSTRAINT "DF_42038f486666a68c553c9a0be60" DEFAULT 0, "tax" decimal(10,2) NOT NULL CONSTRAINT "DF_7e6ec9129e51cf83734790748b0" DEFAULT 0, "total" decimal(10,2) NOT NULL, "shippingName" nvarchar(150) NOT NULL, "shippingLine1" nvarchar(255) NOT NULL, "shippingLine2" nvarchar(255), "shippingCity" nvarchar(100) NOT NULL, "shippingState" nvarchar(100) NOT NULL, "shippingPostalCode" nvarchar(20) NOT NULL, "shippingCountry" nvarchar(100) NOT NULL, "shippingPhone" nvarchar(30) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_1f4b9818a08b822a31493fdee99" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_d42e0dcd4954bbebd2232624bd2" DEFAULT getdate(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0f82354e5b05fd87884eff3a7b" ON "orders" ("storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5680d2d956d66b17d34e61b918" ON "orders" ("storeId", "orderNumber") `);
        await queryRunner.query(`CREATE TABLE "stores" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(150) NOT NULL, "slug" nvarchar(100) NOT NULL, "status" nvarchar(255) CONSTRAINT CHK_0ac797b5d024ba8f394b3a4f9f_ENUM CHECK(status IN ('ACTIVE','SUSPENDED')) NOT NULL CONSTRAINT "DF_53a5f515d8767f635e80b5159bb" DEFAULT 'ACTIVE', "razorpayKeyId" nvarchar(100), "razorpayKeySecretEncrypted" nvarchar(500), "razorpayWebhookSecretEncrypted" nvarchar(500), "createdAt" datetime2 NOT NULL CONSTRAINT "DF_571707c9853a152317bebfd030f" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_d59d32868c198326cf2373b49a1" DEFAULT getdate(), CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_790b2968701a6ff5ff38323776" ON "stores" ("slug") `);
        await queryRunner.query(`CREATE TABLE "carts" ("id" int NOT NULL IDENTITY(1,1), "storeId" int NOT NULL, "customerId" int, "sessionId" nvarchar(100), "status" nvarchar(255) CONSTRAINT CHK_7fc33cfb5c761f6933d20c069b_ENUM CHECK(status IN ('ACTIVE','CONVERTED','ABANDONED')) NOT NULL CONSTRAINT "DF_2ac9384d46d2c642a3855a7ea2a" DEFAULT 'ACTIVE', "createdAt" datetime2 NOT NULL CONSTRAINT "DF_08a66913458db3e557f89c6e829" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_c19f7859d0ead8c988590e9f61e" DEFAULT getdate(), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7ca211e7a4a57288fcb55a6de9" ON "carts" ("storeId") `);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" int NOT NULL IDENTITY(1,1), "cartId" int NOT NULL, "variantId" int NOT NULL, "quantity" int NOT NULL CONSTRAINT "DF_d2ec632b9cce45d1d5dd30b2032" DEFAULT 1, "priceAtAdd" decimal(10,2) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_b85f9ac24bf779f1fcd93319270" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_8c6da413723d6723776da6735c4" DEFAULT getdate(), CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_b5976584943ec93aa5394a55320" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_7f1a676cadb42cc18fe9a367608" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_c543b38cb9c82610bd0848862f4" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_5a27845bc2d79be6f1fa3d2c036" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_5a27845bc2d79be6f1fa3d2c036"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_c543b38cb9c82610bd0848862f4"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_7f1a676cadb42cc18fe9a367608"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_b5976584943ec93aa5394a55320"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP INDEX "IDX_7ca211e7a4a57288fcb55a6de9" ON "carts"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP INDEX "IDX_790b2968701a6ff5ff38323776" ON "stores"`);
        await queryRunner.query(`DROP TABLE "stores"`);
        await queryRunner.query(`DROP INDEX "IDX_5680d2d956d66b17d34e61b918" ON "orders"`);
        await queryRunner.query(`DROP INDEX "IDX_0f82354e5b05fd87884eff3a7b" ON "orders"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
        await queryRunner.query(`DROP INDEX "REL_c543b38cb9c82610bd0848862f" ON "inventory"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
        await queryRunner.query(`DROP TABLE "product_images"`);
        await queryRunner.query(`DROP INDEX "IDX_9844b96a2b5b3620eee675f805" ON "products"`);
        await queryRunner.query(`DROP INDEX "IDX_782da5e50e94b763eb63225d69" ON "products"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP INDEX "IDX_4dc2021f63ca35ec7905cb2fd2" ON "categories"`);
        await queryRunner.query(`DROP INDEX "IDX_fa6ba3528de12e174b163c09fd" ON "categories"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "IDX_3601141586fbfaa357fc6986b6" ON "customers"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP INDEX "IDX_c82cd4fa8f0ac4a74328abe997" ON "users"`);
        await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
