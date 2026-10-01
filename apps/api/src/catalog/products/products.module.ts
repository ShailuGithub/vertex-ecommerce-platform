import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { ProductVariant } from "./entities/product-variant.entity";
import { ProductImage } from "./entities/product-image.entity";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { InventoryModule } from "../../inventory/inventory.module";

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductVariant, ProductImage]), InventoryModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
