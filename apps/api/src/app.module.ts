import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { AnalyticsModule } from "./analytics/analytics.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { validateEnv } from "./config/env.validation";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { CommonModule } from "./common/common.module";
import { StoresModule } from "./stores/stores.module";
import { UsersModule } from "./users/users.module";
import { CustomersModule } from "./customers/customers.module";
import { AddressesModule } from "./addresses/addresses.module";
import { AuthModule } from "./auth/auth.module";
import { CustomerAuthModule } from "./customer-auth/customer-auth.module";
import { CategoriesModule } from "./catalog/categories/categories.module";
import { ProductsModule } from "./catalog/products/products.module";
import { InventoryModule } from "./inventory/inventory.module";
import { UploadsModule } from "./uploads/uploads.module";
import { CartModule } from "./cart/cart.module";
import { CouponsModule } from "./coupons/coupons.module";
import { OrdersModule } from "./orders/orders.module";
import { StorefrontModule } from "./storefront/storefront.module";
import { PlatformModule } from "./platform/platform.module";
import { PaymentsModule } from "./payments/payments.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    DatabaseModule,
    CommonModule,
    HealthModule,
    StoresModule,
    UsersModule,
    CustomersModule,
    AddressesModule,
    AuthModule,
    CustomerAuthModule,
    CategoriesModule,
    InventoryModule,
    ProductsModule,
    UploadsModule,
    CartModule,
    CouponsModule,
    OrdersModule,
    StorefrontModule,
    PlatformModule,
    PaymentsModule,
    AnalyticsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
