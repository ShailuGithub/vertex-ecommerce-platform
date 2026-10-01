import { PaymentStatus } from "@vertex/shared-types";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Order } from "../../orders/entities/order.entity";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  storeId: number;

  @ManyToOne(() => Order, { onDelete: "NO ACTION" })
  order: Order;

  @Column()
  orderId: number;

  @Index()
  @Column({ length: 100 })
  razorpayOrderId: string;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  razorpayPaymentId: string | null;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  razorpaySignature: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 10, default: "INR" })
  currency: string;

  @Column({ type: "simple-enum", enum: PaymentStatus, default: PaymentStatus.CREATED })
  status: PaymentStatus;

  @Column({ type: "nvarchar", length: 50, nullable: true })
  method: string | null;

  @Column({ type: "ntext", nullable: true })
  rawResponse: string | null;

  @Column({ type: "datetime2", nullable: true })
  webhookVerifiedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
