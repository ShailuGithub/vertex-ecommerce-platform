import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { OptionalCustomerJwtAuthGuard } from "../customer-auth/guards/optional-customer-jwt-auth.guard";
import { StoreContextGuard } from "../stores/guards/store-context.guard";
import { CurrentStore } from "../stores/decorators/current-store.decorator";
import { CurrentCustomer } from "../common/decorators/current-customer.decorator";
import { AuthenticatedCustomer } from "../common/types/authenticated-customer";
import { Store } from "../stores/entities/store.entity";
import { CartService } from "./cart.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { ApplyCouponDto } from "./dto/apply-coupon.dto";

const CART_SESSION_COOKIE = "cart_session";

@Controller("stores/:storeSlug/cart")
@UseGuards(StoreContextGuard, OptionalCustomerJwtAuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly config: ConfigService,
  ) {}

  private resolveSessionId(
    req: Request,
    res: Response,
    customer: AuthenticatedCustomer | null,
  ): string | null {
    if (customer) return null;

    let sessionId = req.cookies?.[CART_SESSION_COOKIE];
    if (!sessionId) {
      sessionId = randomUUID();
      res.cookie(CART_SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: this.config.get<string>("NODE_ENV") === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      });
    }
    return sessionId;
  }

  @Get()
  async getCart(
    @CurrentStore() store: Store,
    @CurrentCustomer() customer: AuthenticatedCustomer | null,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = this.resolveSessionId(req, res, customer);
    return this.cartService.getOrCreateCart(store.id, customer?.customerId ?? null, sessionId);
  }

  @Post("items")
  async addItem(
    @Body() dto: AddCartItemDto,
    @CurrentStore() store: Store,
    @CurrentCustomer() customer: AuthenticatedCustomer | null,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = this.resolveSessionId(req, res, customer);
    const cart = await this.cartService.getOrCreateCart(store.id, customer?.customerId ?? null, sessionId);
    return this.cartService.addItem(store.id, cart, dto.variantId, dto.quantity);
  }

  @Patch("items/:itemId")
  async updateItem(
    @Param("itemId", ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
    @CurrentStore() store: Store,
    @CurrentCustomer() customer: AuthenticatedCustomer | null,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = this.resolveSessionId(req, res, customer);
    const cart = await this.cartService.getOrCreateCart(store.id, customer?.customerId ?? null, sessionId);
    return this.cartService.updateItem(cart, itemId, dto.quantity);
  }

  @Delete("items/:itemId")
  async removeItem(
    @Param("itemId", ParseIntPipe) itemId: number,
    @CurrentStore() store: Store,
    @CurrentCustomer() customer: AuthenticatedCustomer | null,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = this.resolveSessionId(req, res, customer);
    const cart = await this.cartService.getOrCreateCart(store.id, customer?.customerId ?? null, sessionId);
    return this.cartService.removeItem(cart, itemId);
  }

  @Post("coupon")
  async applyCoupon(
    @Body() dto: ApplyCouponDto,
    @CurrentStore() store: Store,
    @CurrentCustomer() customer: AuthenticatedCustomer | null,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = this.resolveSessionId(req, res, customer);
    const cart = await this.cartService.getOrCreateCart(store.id, customer?.customerId ?? null, sessionId);
    return this.cartService.applyCoupon(store.id, customer?.customerId ?? null, cart, dto.code);
  }

  @Delete("coupon")
  async removeCoupon(
    @CurrentStore() store: Store,
    @CurrentCustomer() customer: AuthenticatedCustomer | null,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = this.resolveSessionId(req, res, customer);
    const cart = await this.cartService.getOrCreateCart(store.id, customer?.customerId ?? null, sessionId);
    return this.cartService.removeCoupon(cart);
  }
}
