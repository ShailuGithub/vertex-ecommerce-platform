import { ExtraChargeType } from "@vertex/shared-types";
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("store_extra_charges")
export class StoreExtraCharge {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  storeId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: "simple-enum", enum: ExtraChargeType, default: ExtraChargeType.FIXED })
  type: ExtraChargeType;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "bit", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
