import { Module } from "@nestjs/common";
import { CategoriesModule } from "../catalog/categories/categories.module";
import { ProductsModule } from "../catalog/products/products.module";
import { StorefrontCatalogController } from "./storefront-catalog.controller";

@Module({
  imports: [CategoriesModule, ProductsModule],
  controllers: [StorefrontCatalogController],
})
export class StorefrontModule {}
