import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { ProductVariant } from "../../catalog/products/entities/product-variant.entity";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  order: Order;

  @Column()
  orderId: number;

  @ManyToOne(() => ProductVariant, { onDelete: "NO ACTION" })
  variant: ProductVariant;

  @Column()
  variantId: number;

  @Column({ length: 200 })
  productNameSnapshot: string;

  @Column({ length: 100 })
  skuSnapshot: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  unitPrice: number;

  @Column()
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  lineTotal: number;
}
