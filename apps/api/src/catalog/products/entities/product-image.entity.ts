import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductVariant } from "./product-variant.entity";

@Entity("product_images")
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductVariant, (variant) => variant.images, { onDelete: "CASCADE" })
  variant: ProductVariant;

  @Column()
  variantId: number;

  @Column({ length: 500 })
  url: string;

  @Column({ type: "nvarchar", length: 200, nullable: true })
  altText: string | null;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
