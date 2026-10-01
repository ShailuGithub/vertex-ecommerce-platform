import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Customer } from "../../customers/entities/customer.entity";

@Entity("addresses")
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.addresses, { onDelete: "CASCADE" })
  customer: Customer;

  @Column()
  customerId: number;

  @Column({ type: "nvarchar", length: 50, nullable: true })
  label: string | null;

  @Column({ length: 150 })
  recipientName: string;

  @Column({ length: 255 })
  line1: string;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  line2: string | null;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 20 })
  postalCode: string;

  @Column({ length: 100, default: "India" })
  country: string;

  @Column({ type: "nvarchar", length: 30, nullable: true })
  phone: string | null;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
