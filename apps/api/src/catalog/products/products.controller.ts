import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@vertex/shared-types";
import { MerchantJwtAuthGuard } from "../../auth/guards/merchant-jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CreateProductVariantDto } from "./dto/create-product-variant.dto";
import { AddProductImageDto } from "./dto/add-product-image.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";

@Controller("products")
@UseGuards(MerchantJwtAuthGuard, RolesGuard)
@Roles(UserRole.STORE_OWNER, UserRole.STORE_STAFF)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.productsService.findAll(user.storeId!, {
      search,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get(":slug")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("slug") slug: string) {
    return this.productsService.findBySlug(user.storeId!, slug);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.storeId!, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(user.storeId!, id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  @Roles(UserRole.STORE_OWNER)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) {
    await this.productsService.remove(user.storeId!, id);
  }

  @Post(":id/variants")
  addVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.productsService.createVariant(user.storeId!, id, dto);
  }

  @Patch("variants/:variantId/inventory")
  updateInventory(
    @CurrentUser() user: AuthenticatedUser,
    @Param("variantId", ParseIntPipe) variantId: number,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.productsService.updateInventory(user.storeId!, variantId, dto);
  }

  @Post("variants/:variantId/images")
  addImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("variantId", ParseIntPipe) variantId: number,
    @Body() dto: AddProductImageDto,
  ) {
    return this.productsService.addImage(user.storeId!, variantId, dto);
  }

  @Patch("variants/:variantId/images/:imageId/primary")
  async setPrimaryImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("variantId", ParseIntPipe) variantId: number,
    @Param("imageId", ParseIntPipe) imageId: number,
  ) {
    await this.productsService.setPrimaryImage(user.storeId!, variantId, imageId);
    return { ok: true };
  }

  @Delete("variants/:variantId/images/:imageId")
  @HttpCode(204)
  async removeImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("variantId", ParseIntPipe) variantId: number,
    @Param("imageId", ParseIntPipe) imageId: number,
  ) {
    await this.productsService.removeImage(user.storeId!, variantId, imageId);
  }
}
