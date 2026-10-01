import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { ProductVariant } from "./entities/product-variant.entity";
import { ProductImage } from "./entities/product-image.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CreateProductVariantDto } from "./dto/create-product-variant.dto";
import { AddProductImageDto } from "./dto/add-product-image.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { InventoryService } from "../../inventory/inventory.service";
import { Inventory } from "../../inventory/entities/inventory.entity";

const RELATIONS = ["variants", "variants.images", "variants.inventory", "category"];

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imagesRepository: Repository<ProductImage>,
    private readonly inventoryService: InventoryService,
  ) {}

  async findAll(
    storeId: number,
    params: { categoryId?: number; search?: string; page?: number; pageSize?: number },
  ): Promise<{ items: Product[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

    // Paginate over plain product ids first (a join to variants/images would
    // multiply rows and break skip/take), then reload that page with relations.
    const idQuery = this.productsRepository
      .createQueryBuilder("product")
      .select("product.id", "id")
      .where("product.storeId = :storeId", { storeId })
      .andWhere("product.isActive = :isActive", { isActive: true });

    if (params.categoryId) {
      idQuery.andWhere("product.categoryId = :categoryId", { categoryId: params.categoryId });
    }
    if (params.search) {
      idQuery.andWhere("product.name LIKE :search", { search: `%${params.search}%` });
    }

    const total = await idQuery.getCount();
    const idRows = await idQuery
      .orderBy("product.createdAt", "DESC")
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .getRawMany<{ id: number }>();

    const ids = idRows.map((row) => row.id);
    if (ids.length === 0) {
      return { items: [], total, page, pageSize };
    }

    const items = await this.productsRepository.find({
      where: { id: In(ids) },
      relations: ["category", "variants", "variants.images", "variants.inventory"],
    });
    const orderIndex = new Map(ids.map((id, i) => [id, i]));
    items.sort((a, b) => orderIndex.get(a.id)! - orderIndex.get(b.id)!);

    return { items, total, page, pageSize };
  }

  async findBySlug(storeId: number, slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { storeId, slug },
      relations: RELATIONS,
    });
    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }
    return product;
  }

  async findById(storeId: number, id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { storeId, id },
      relations: RELATIONS,
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async create(storeId: number, dto: CreateProductDto): Promise<Product> {
    const existingSlug = await this.productsRepository.findOne({ where: { storeId, slug: dto.slug } });
    if (existingSlug) {
      throw new ConflictException(`Product slug "${dto.slug}" already in use`);
    }

    const product = this.productsRepository.create({
      storeId,
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? "",
      basePrice: dto.basePrice,
      compareAtPrice: dto.compareAtPrice ?? null,
      categoryId: dto.categoryId,
      brand: dto.brand ?? null,
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
    });
    const saved = await this.productsRepository.save(product);

    for (const variantDto of dto.variants) {
      await this.createVariant(storeId, saved.id, variantDto);
    }

    return this.findById(storeId, saved.id);
  }

  async update(storeId: number, id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(storeId, id);
    Object.assign(product, dto);
    await this.productsRepository.save(product);
    return this.findById(storeId, id);
  }

  async remove(storeId: number, id: number): Promise<void> {
    const product = await this.findById(storeId, id);
    await this.productsRepository.remove(product);
  }

  private async skuInUseForStore(storeId: number, sku: string): Promise<boolean> {
    const count = await this.variantsRepository
      .createQueryBuilder("variant")
      .innerJoin("variant.product", "product")
      .where("product.storeId = :storeId", { storeId })
      .andWhere("variant.sku = :sku", { sku })
      .getCount();
    return count > 0;
  }

  async createVariant(
    storeId: number,
    productId: number,
    dto: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    await this.findById(storeId, productId); // throws if product doesn't belong to this store

    if (await this.skuInUseForStore(storeId, dto.sku)) {
      throw new ConflictException(`SKU "${dto.sku}" already in use`);
    }

    const variant = this.variantsRepository.create({
      productId,
      sku: dto.sku,
      attributes: dto.attributes,
      price: dto.price ?? null,
    });
    const saved = await this.variantsRepository.save(variant);
    await this.inventoryService.createForVariant(saved.id, dto.quantityOnHand ?? 0);
    return saved;
  }

  async updateInventory(storeId: number, variantId: number, dto: UpdateInventoryDto): Promise<Inventory> {
    const variant = await this.variantsRepository.findOne({
      where: { id: variantId, product: { storeId } },
    });
    if (!variant) {
      throw new NotFoundException(`Variant #${variantId} not found`);
    }
    const inventory = await this.inventoryService.setQuantity(variantId, dto.quantityOnHand);
    if (!inventory) {
      throw new NotFoundException(`Inventory record for variant #${variantId} not found`);
    }
    return inventory;
  }

  async addImage(storeId: number, variantId: number, dto: AddProductImageDto): Promise<ProductImage> {
    const variant = await this.variantsRepository.findOne({
      where: { id: variantId, product: { storeId } },
    });
    if (!variant) {
      throw new NotFoundException(`Variant #${variantId} not found`);
    }

    const makePrimary = dto.isPrimary ?? false;
    if (makePrimary) {
      await this.imagesRepository.update({ variantId }, { isPrimary: false });
    }

    const image = this.imagesRepository.create({
      variantId,
      url: dto.url,
      altText: dto.altText ?? null,
      isPrimary: makePrimary,
    });
    return this.imagesRepository.save(image);
  }

  async setPrimaryImage(storeId: number, variantId: number, imageId: number): Promise<void> {
    const image = await this.imagesRepository.findOne({
      where: { id: imageId, variantId, variant: { product: { storeId } } },
    });
    if (!image) {
      throw new NotFoundException(`Image #${imageId} not found`);
    }
    await this.imagesRepository.update({ variantId }, { isPrimary: false });
    await this.imagesRepository.update({ id: imageId }, { isPrimary: true });
  }

  async removeImage(storeId: number, variantId: number, imageId: number): Promise<void> {
    const image = await this.imagesRepository.findOne({
      where: { id: imageId, variantId, variant: { product: { storeId } } },
    });
    if (!image) {
      throw new NotFoundException(`Image #${imageId} not found`);
    }
    await this.imagesRepository.remove(image);
  }
}
