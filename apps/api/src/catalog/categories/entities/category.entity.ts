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

@Entity("categories")
@Index(["storeId", "slug"], { unique: true })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  storeId: number;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 160 })
  slug: string;

  @Column({ type: "nvarchar", length: 1000, nullable: true })
  description: string | null;

  @Column({ type: "nvarchar", length: 500, nullable: true })
  imageUrl: string | null;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true, onDelete: "NO ACTION" })
  parent: Category | null;

  @Column({ type: "int", nullable: true })
  parentId: number | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
