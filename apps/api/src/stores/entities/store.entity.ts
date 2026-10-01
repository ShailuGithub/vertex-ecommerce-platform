import { AverageDeliveryTime, DeliveryChargeType, StoreStatus } from "@vertex/shared-types";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("stores")
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 100 })
  slug: string;

  @Column({ type: "simple-enum", enum: StoreStatus, default: StoreStatus.ACTIVE })
  status: StoreStatus;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  razorpayKeyId: string | null;

  @Column({ type: "nvarchar", length: 500, nullable: true })
  razorpayKeySecretEncrypted: string | null;

  @Column({ type: "nvarchar", length: 500, nullable: true })
  razorpayWebhookSecretEncrypted: string | null;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  contactEmail: string | null;

  @Column({ type: "nvarchar", length: 30, nullable: true })
  contactPhone: string | null;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  addressLine1: string | null;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  addressLine2: string | null;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  city: string | null;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  state: string | null;

  @Column({ type: "nvarchar", length: 20, nullable: true })
  postalCode: string | null;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  country: string | null;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  customDomain: string | null;

  @Column({ type: "nvarchar", length: "MAX", nullable: true })
  checkoutPolicyText: string | null;

  @Column({ type: "nvarchar", length: "MAX", nullable: true })
  taxPolicyText: string | null;

  @Column({ type: "nvarchar", length: "MAX", nullable: true })
  returnsPolicyText: string | null;

  // Delivery
  @Column({ type: "simple-enum", enum: DeliveryChargeType, default: DeliveryChargeType.FIXED })
  deliveryChargeType: DeliveryChargeType;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  deliveryChargeAmount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  freeDeliveryAboveAmount: number | null;

  @Column({ type: "simple-enum", enum: AverageDeliveryTime, nullable: true })
  averageDeliveryTime: AverageDeliveryTime | null;

  // Store timings
  @Column({ type: "nvarchar", length: "MAX", nullable: true })
  storeTimingsJson: string | null;

  // Tax
  @Column({ type: "bit", default: false })
  taxEnabled: boolean;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  taxRatePercent: number | null;

  @Column({ type: "bit", default: false })
  taxInclusive: boolean;

  // Returns
  @Column({ type: "bit", default: false })
  returnsEnabled: boolean;

  @Column({ type: "int", nullable: true })
  returnWindowDays: number | null;

  // Support & social
  @Column({ type: "nvarchar", length: 255, nullable: true })
  supportEmail: string | null;

  @Column({ type: "nvarchar", length: 30, nullable: true })
  supportPhone: string | null;

  @Column({ type: "nvarchar", length: 30, nullable: true })
  whatsappNumber: string | null;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  facebookUrl: string | null;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  instagramUrl: string | null;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  twitterUrl: string | null;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  youtubeUrl: string | null;

  // SEO
  @Column({ type: "nvarchar", length: 255, nullable: true })
  seoTitle: string | null;

  @Column({ type: "nvarchar", length: 500, nullable: true })
  seoDescription: string | null;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  seoKeywords: string | null;

  // Notifications
  @Column({ type: "nvarchar", length: 255, nullable: true })
  notificationEmail: string | null;

  @Column({ type: "bit", default: true })
  notifyNewOrder: boolean;

  @Column({ type: "bit", default: true })
  notifyLowStock: boolean;

  @Column({ type: "bit", default: false })
  notifyCustomerSignup: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
