import { CouponType } from "@vertex/shared-types";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("coupons")
@Index(["storeId", "code"], { unique: true })
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  storeId: number;

  @Column({ length: 40 })
  code: string;

  @Column({ type: "simple-enum", enum: CouponType })
  type: CouponType;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  value: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  minOrderValue: number | null;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number | null;

  @Column({ type: "int", nullable: true })
  usageLimitTotal: number | null;

  @Column({ type: "int", nullable: true })
  usageLimitPerCustomer: number | null;

  @Column({ type: "datetime2", nullable: true })
  startsAt: Date | null;

  @Column({ type: "datetime2", nullable: true })
  expiresAt: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
