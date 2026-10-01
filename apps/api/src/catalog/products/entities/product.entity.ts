import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "../../categories/entities/category.entity";
import { ProductVariant } from "./product-variant.entity";

@Entity("products")
@Index(["storeId", "slug"], { unique: true })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  storeId: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 220 })
  slug: string;

  @Column({ type: "nvarchar", length: 4000, default: "" })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  basePrice: number;

  // The "original" price shown struck through next to basePrice when higher
  // than it, e.g. MRP ₹400 discounted to ₹350. Null means no discount shown.
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  compareAtPrice: number | null;

  @ManyToOne(() => Category, { onDelete: "NO ACTION" })
  category: Category;

  @Column()
  categoryId: number;

  @Column({ type: "nvarchar", length: 150, nullable: true })
  brand: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "nvarchar", length: 200, nullable: true })
  metaTitle: string | null;

  @Column({ type: "nvarchar", length: 500, nullable: true })
  metaDescription: string | null;

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants: ProductVariant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
