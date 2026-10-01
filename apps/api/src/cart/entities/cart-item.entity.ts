import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Cart } from "./cart.entity";
import { ProductVariant } from "../../catalog/products/entities/product-variant.entity";

@Entity("cart_items")
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  cart: Cart;

  @Column()
  cartId: number;

  @ManyToOne(() => ProductVariant, { onDelete: "CASCADE" })
  variant: ProductVariant;

  @Column()
  variantId: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  priceAtAdd: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
