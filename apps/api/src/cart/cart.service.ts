import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CartStatus } from "@vertex/shared-types";
import { IsNull, Repository } from "typeorm";
import { Cart } from "./entities/cart.entity";
import { CartItem } from "./entities/cart-item.entity";
import { ProductVariant } from "../catalog/products/entities/product-variant.entity";
import { CouponsService } from "../coupons/coupons.service";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
    private readonly couponsService: CouponsService,
  ) {}

  private withItems(cart: Cart): Promise<Cart> {
    return this.cartsRepository.findOneOrFail({
      where: { id: cart.id },
      relations: ["items", "items.variant", "items.variant.product", "items.variant.images"],
    });
  }

  private async findVariantInStore(storeId: number, variantId: number): Promise<ProductVariant> {
    const variant = await this.variantsRepository.findOne({
      where: { id: variantId, product: { storeId } },
      relations: ["product"],
    });
    if (!variant) {
      throw new NotFoundException(`Variant #${variantId} not found`);
    }
    return variant;
  }

  async getOrCreateCart(
    storeId: number,
    customerId: number | null,
    sessionId: string | null,
  ): Promise<Cart> {
    let cart: Cart | null = null;

    if (customerId) {
      cart = await this.cartsRepository.findOne({
        where: { storeId, customerId, status: CartStatus.ACTIVE },
      });
    } else if (sessionId) {
      cart = await this.cartsRepository.findOne({
        where: { storeId, sessionId, customerId: IsNull(), status: CartStatus.ACTIVE },
      });
    }

    if (!cart) {
      cart = await this.cartsRepository.save(
        this.cartsRepository.create({
          storeId,
          customerId: customerId ?? null,
          sessionId: customerId ? null : sessionId,
          status: CartStatus.ACTIVE,
        }),
      );
    }

    return this.withItems(cart);
  }

  async addItem(storeId: number, cart: Cart, variantId: number, quantity: number): Promise<Cart> {
    const variant = await this.findVariantInStore(storeId, variantId);

    const existing = await this.cartItemsRepository.findOne({ where: { cartId: cart.id, variantId } });
    const unitPrice = variant.price ?? variant.product.basePrice;

    if (existing) {
      existing.quantity += quantity;
      await this.cartItemsRepository.save(existing);
    } else {
      await this.cartItemsRepository.save(
        this.cartItemsRepository.create({
          cartId: cart.id,
          variantId,
          quantity,
          priceAtAdd: unitPrice,
        }),
      );
    }

    const updated = await this.withItems(cart);
    await this.refreshCoupon(updated);
    return updated;
  }

  async updateItem(cart: Cart, itemId: number, quantity: number): Promise<Cart> {
    const item = await this.cartItemsRepository.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) {
      throw new NotFoundException(`Cart item #${itemId} not found`);
    }
    item.quantity = quantity;
    await this.cartItemsRepository.save(item);
    const updated = await this.withItems(cart);
    await this.refreshCoupon(updated);
    return updated;
  }

  async removeItem(cart: Cart, itemId: number): Promise<Cart> {
    const item = await this.cartItemsRepository.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) {
      throw new NotFoundException(`Cart item #${itemId} not found`);
    }
    await this.cartItemsRepository.remove(item);
    const updated = await this.withItems(cart);
    await this.refreshCoupon(updated);
    return updated;
  }

  async applyCoupon(storeId: number, customerId: number | null, cart: Cart, code: string): Promise<Cart> {
    const subtotal = this.computeSubtotal(cart);
    const { coupon, discountAmount } = await this.couponsService.validateAndPrice(
      storeId,
      customerId,
      code,
      subtotal,
    );
    await this.cartsRepository.update(cart.id, { couponCode: coupon.code, discountAmount });
    return this.withItems(cart);
  }

  async removeCoupon(cart: Cart): Promise<Cart> {
    await this.cartsRepository.update(cart.id, { couponCode: null, discountAmount: 0 });
    return this.withItems(cart);
  }

  private async refreshCoupon(cart: Cart): Promise<void> {
    if (!cart.couponCode) return;
    try {
      const subtotal = this.computeSubtotal(cart);
      const { discountAmount } = await this.couponsService.validateAndPrice(
        cart.storeId,
        cart.customerId,
        cart.couponCode,
        subtotal,
      );
      if (Number(discountAmount) !== Number(cart.discountAmount)) {
        await this.cartsRepository.update(cart.id, { discountAmount });
        cart.discountAmount = discountAmount;
      }
    } catch {
      await this.cartsRepository.update(cart.id, { couponCode: null, discountAmount: 0 });
      cart.couponCode = null;
      cart.discountAmount = 0;
    }
  }

  async markConverted(cartId: number): Promise<void> {
    await this.cartsRepository.update(cartId, { status: CartStatus.CONVERTED });
  }

  async mergeGuestCartIntoCustomer(
    storeId: number,
    sessionId: string | null,
    customerId: number,
  ): Promise<void> {
    if (!sessionId) return;

    const guestCart = await this.cartsRepository.findOne({
      where: { storeId, sessionId, customerId: IsNull(), status: CartStatus.ACTIVE },
      relations: ["items"],
    });
    if (!guestCart) return;

    const customerCart = await this.cartsRepository.findOne({
      where: { storeId, customerId, status: CartStatus.ACTIVE },
      relations: ["items"],
    });

    if (!customerCart) {
      guestCart.customerId = customerId;
      guestCart.sessionId = null;
      await this.cartsRepository.save(guestCart);
      return;
    }

    for (const guestItem of guestCart.items) {
      const existing = customerCart.items.find((item) => item.variantId === guestItem.variantId);
      if (existing) {
        existing.quantity += guestItem.quantity;
        await this.cartItemsRepository.save(existing);
      } else {
        await this.cartItemsRepository.save(
          this.cartItemsRepository.create({
            cartId: customerCart.id,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
            priceAtAdd: guestItem.priceAtAdd,
          }),
        );
      }
    }

    await this.cartItemsRepository.remove(guestCart.items);
    guestCart.status = CartStatus.CONVERTED;
    await this.cartsRepository.save(guestCart);
  }

  computeSubtotal(cart: Cart): number {
    return cart.items.reduce((sum, item) => sum + Number(item.priceAtAdd) * item.quantity, 0);
  }

  assertNotEmpty(cart: Cart): void {
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }
  }
}
