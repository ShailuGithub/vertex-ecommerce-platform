export enum UserRole {
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
  STORE_OWNER = "STORE_OWNER",
  STORE_STAFF = "STORE_STAFF",
}

export enum StoreStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum ShippingMethod {
  SELF = "SELF",
  COURIER = "COURIER",
}

export enum PaymentStatus {
  CREATED = "CREATED",
  AUTHORIZED = "AUTHORIZED",
  CAPTURED = "CAPTURED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum CartStatus {
  ACTIVE = "ACTIVE",
  CONVERTED = "CONVERTED",
  ABANDONED = "ABANDONED",
}

export enum CouponType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

export enum DeliveryChargeType {
  FIXED = "FIXED",
  VARIABLE = "VARIABLE",
}

export enum AverageDeliveryTime {
  MIN_30_60 = "MIN_30_60",
  HOUR_1_4 = "HOUR_1_4",
  HOUR_6_24 = "HOUR_6_24",
  DAY_1_3 = "DAY_1_3",
  DAY_3_5 = "DAY_3_5",
  DAY_5_10 = "DAY_5_10",
  DAY_10_PLUS = "DAY_10_PLUS",
}

export enum ExtraChargeType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
}

export enum Weekday {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}
