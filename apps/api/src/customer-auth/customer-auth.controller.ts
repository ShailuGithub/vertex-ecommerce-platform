import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { CustomerAuthService, CustomerAuthTokens } from "./customer-auth.service";
import { CustomerRegisterDto } from "./dto/customer-register.dto";
import { CustomerLoginDto } from "./dto/customer-login.dto";
import { CustomerJwtAuthGuard } from "./guards/customer-jwt-auth.guard";
import { StoreContextGuard } from "../stores/guards/store-context.guard";
import { CurrentStore } from "../stores/decorators/current-store.decorator";
import { CurrentCustomer } from "../common/decorators/current-customer.decorator";
import { AuthenticatedCustomer } from "../common/types/authenticated-customer";
import { Store } from "../stores/entities/store.entity";
import { Customer } from "../customers/entities/customer.entity";
import { CustomersService } from "../customers/customers.service";
import { CartService } from "../cart/cart.service";

function toPublicCustomer(customer: Customer) {
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
  };
}

@Controller("stores/:storeSlug/auth")
@UseGuards(StoreContextGuard)
export class CustomerAuthController {
  constructor(
    private readonly customerAuthService: CustomerAuthService,
    private readonly customersService: CustomersService,
    private readonly cartService: CartService,
    private readonly config: ConfigService,
  ) {}

  private setAuthCookies(res: Response, tokens: CustomerAuthTokens) {
    const secure = this.isCookieSecure();
    res.cookie("customer_access_token", tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });
    res.cookie("customer_refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  private isCookieSecure(): boolean {
    // COOKIE_SECURE lets a deployment opt out of the `production` default -
    // e.g. serving over plain HTTP before TLS is set up, where a Secure
    // cookie would be silently dropped by the browser and break login.
    const override = this.config.get<boolean>("COOKIE_SECURE");
    if (override !== undefined) return override;
    return this.config.get<string>("NODE_ENV") === "production";
  }

  @Post("register")
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(
    @Body() dto: CustomerRegisterDto,
    @CurrentStore() store: Store,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { customer, tokens } = await this.customerAuthService.register(store.id, dto);
    this.setAuthCookies(res, tokens);
    await this.cartService.mergeGuestCartIntoCustomer(
      store.id,
      req.cookies?.cart_session ?? null,
      customer.id,
    );
    return { customer: toPublicCustomer(customer) };
  }

  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() dto: CustomerLoginDto,
    @CurrentStore() store: Store,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const customer = await this.customerAuthService.validateCredentials(store.id, dto.email, dto.password);
    const { tokens } = this.customerAuthService.login(customer);
    this.setAuthCookies(res, tokens);
    await this.cartService.mergeGuestCartIntoCustomer(
      store.id,
      req.cookies?.cart_session ?? null,
      customer.id,
    );
    return { customer: toPublicCustomer(customer) };
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.customer_refresh_token;
    if (!refreshToken) {
      return { error: "No refresh token" };
    }
    const tokens = await this.customerAuthService.refresh(refreshToken);
    this.setAuthCookies(res, tokens);
    return { ok: true };
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("customer_access_token", { path: "/" });
    res.clearCookie("customer_refresh_token", { path: "/" });
    return { ok: true };
  }

  @Get("me")
  @UseGuards(CustomerJwtAuthGuard)
  async me(@CurrentCustomer() current: AuthenticatedCustomer) {
    const customer = await this.customersService.findById(current.customerId);
    return { customer: customer ? toPublicCustomer(customer) : null };
  }
}
