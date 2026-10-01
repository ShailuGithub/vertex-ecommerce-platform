import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
import { Product } from "../products/entities/product.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  findAll(storeId: number): Promise<Category[]> {
    return this.categoriesRepository.find({ where: { storeId }, order: { name: "ASC" } });
  }

  async findBySlug(storeId: number, slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { storeId, slug } });
    if (!category) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }
    return category;
  }

  async findById(storeId: number, id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { storeId, id } });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async create(storeId: number, dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoriesRepository.findOne({ where: { storeId, slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Category slug "${dto.slug}" already in use`);
    }
    const category = this.categoriesRepository.create({
      ...dto,
      storeId,
      parentId: dto.parentId ?? null,
    });
    return this.categoriesRepository.save(category);
  }

  async update(storeId: number, id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(storeId, id);
    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async remove(storeId: number, id: number): Promise<void> {
    const category = await this.findById(storeId, id);

    const productCount = await this.productsRepository.count({ where: { storeId, categoryId: id } });
    if (productCount > 0) {
      throw new ConflictException(
        `Category "${category.name}" still has ${productCount} product(s). Move or delete them first.`,
      );
    }

    await this.categoriesRepository.update({ storeId, parentId: id }, { parentId: null });
    await this.categoriesRepository.remove(category);
  }
}
