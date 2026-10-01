import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "./product.entity";
import { ProductImage } from "./product-image.entity";
import { Inventory } from "../../../inventory/entities/inventory.entity";

@Entity("product_variants")
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: "CASCADE" })
  product: Product;

  @Column()
  productId: number;

  @Column({ length: 100 })
  sku: string;

  @Column({ type: "simple-json" })
  attributes: Record<string, string>;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price: number | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ProductImage, (image) => image.variant, { cascade: true })
  images: ProductImage[];

  @OneToOne(() => Inventory, (inventory) => inventory.variant, { cascade: true })
  inventory: Inventory;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
