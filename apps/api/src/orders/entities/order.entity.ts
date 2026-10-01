import { OrderStatus, ShippingMethod } from "@vertex/shared-types";
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
import { Customer } from "../../customers/entities/customer.entity";
import { OrderItem } from "./order-item.entity";

@Entity("orders")
@Index(["storeId", "orderNumber"], { unique: true })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  storeId: number;

  @Column({ length: 30 })
  orderNumber: string;

  @ManyToOne(() => Customer, { onDelete: "NO ACTION" })
  customer: Customer;

  @Column()
  customerId: number;

  @Column({ type: "simple-enum", enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: "nvarchar", length: 40, nullable: true })
  couponCode: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total: number;

  @Column({ length: 150 })
  shippingName: string;

  @Column({ length: 255 })
  shippingLine1: string;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  shippingLine2: string | null;

  @Column({ length: 100 })
  shippingCity: string;

  @Column({ length: 100 })
  shippingState: string;

  @Column({ length: 20 })
  shippingPostalCode: string;

  @Column({ length: 100 })
  shippingCountry: string;

  @Column({ length: 30 })
  shippingPhone: string;

  @Column({ type: "simple-enum", enum: ShippingMethod, nullable: true })
  shippingMethod: ShippingMethod | null;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  courierName: string | null;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  trackingNumber: string | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
