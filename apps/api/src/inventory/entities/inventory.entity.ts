import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProductVariant } from "../../catalog/products/entities/product-variant.entity";

@Entity("inventory")
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ProductVariant, (variant) => variant.inventory, { onDelete: "CASCADE" })
  @JoinColumn()
  variant: ProductVariant;

  @Column({ unique: true })
  variantId: number;

  @Column({ default: 0 })
  quantityOnHand: number;

  @Column({ default: 0 })
  quantityReserved: number;

  @Column({ default: 5 })
  lowStockThreshold: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
