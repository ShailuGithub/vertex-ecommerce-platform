import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Address } from "../../addresses/entities/address.entity";

@Entity("customers")
@Index(["storeId", "email"], { unique: true })
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  storeId: number;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ type: "nvarchar", length: 30, nullable: true })
  phone: string | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Address, (address) => address.customer)
  addresses: Address[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
