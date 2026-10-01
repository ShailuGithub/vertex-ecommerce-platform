import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("coupon_redemptions")
export class CouponRedemption {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  couponId: number;

  @Column()
  storeId: number;

  @Column()
  customerId: number;

  @Index({ unique: true })
  @Column()
  orderId: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  discountAmount: number;

  @CreateDateColumn()
  createdAt: Date;
}
