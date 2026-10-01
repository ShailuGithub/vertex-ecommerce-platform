import { OrderStatus } from "@vertex/shared-types";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { User } from "../../users/entities/user.entity";

@Entity("order_status_history")
export class OrderStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  order: Order;

  @Column()
  orderId: number;

  @Column({ type: "simple-enum", enum: OrderStatus })
  status: OrderStatus;

  @Column({ type: "nvarchar", length: 500, nullable: true })
  note: string | null;

  @ManyToOne(() => User, { onDelete: "NO ACTION", nullable: true })
  changedByUser: User | null;

  @Column({ type: "int", nullable: true })
  changedByUserId: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
