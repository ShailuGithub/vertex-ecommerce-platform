import { CartStatus } from "@vertex/shared-types";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CartItem } from "./cart-item.entity";

@Entity("carts")
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  storeId: number;

  @Column({ type: "int", nullable: true })
  customerId: number | null;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  sessionId: string | null;

  @Column({ type: "simple-enum", enum: CartStatus, default: CartStatus.ACTIVE })
  status: CartStatus;

  @Column({ type: "nvarchar", length: 40, nullable: true })
  couponCode: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
