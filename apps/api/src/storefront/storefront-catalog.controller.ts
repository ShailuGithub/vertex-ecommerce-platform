import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { StoreContextGuard } from "../stores/guards/store-context.guard";
import { CurrentStore } from "../stores/decorators/current-store.decorator";
import { Store } from "../stores/entities/store.entity";
import { CategoriesService } from "../catalog/categories/categories.service";
import { ProductsService } from "../catalog/products/products.service";

@Controller("stores/:storeSlug")
@UseGuards(StoreContextGuard)
export class StorefrontCatalogController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  @Get("categories")
  findAllCategories(@CurrentStore() store: Store) {
    return this.categoriesService.findAll(store.id);
  }

  @Get("categories/:categorySlug")
  findOneCategory(@CurrentStore() store: Store, @Param("categorySlug") categorySlug: string) {
    return this.categoriesService.findBySlug(store.id, categorySlug);
  }

  @Get("products")
  findAllProducts(
    @CurrentStore() store: Store,
    @Query("categoryId") categoryId?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.productsService.findAll(store.id, {
      categoryId: categoryId ? Number(categoryId) : undefined,
      search,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get("products/:productSlug")
  findOneProduct(@CurrentStore() store: Store, @Param("productSlug") productSlug: string) {
    return this.productsService.findBySlug(store.id, productSlug);
  }
}
