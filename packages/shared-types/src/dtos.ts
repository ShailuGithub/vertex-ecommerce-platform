import { OrderStatus, PaymentStatus, StoreStatus, UserRole } from "./enums";

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  storeId: number | null;
}

export interface CustomerDto {
  id: number;
  storeId: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface StoreDto {
  id: number;
  name: string;
  slug: string;
  status: StoreStatus;
}

export interface ProductImageDto {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariantDto {
  id: number;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  images: ProductImageDto[];
  quantityOnHand: number;
}

export interface ProductDto {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: number;
  variants: ProductVariantDto[];
}

export interface CategoryDto {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  parentId: number | null;
}

export interface CartItemDto {
  id: number;
  variantId: number;
  quantity: number;
  priceAtAdd: number;
}

export interface CartDto {
  id: number;
  items: CartItemDto[];
}

export interface OrderItemDto {
  id: number;
  variantId: number;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDto {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  items: OrderItemDto[];
  createdAt: string;
}

export interface PaymentDto {
  id: number;
  orderId: number;
  status: PaymentStatus;
  amount: number;
  currency: string;
}
