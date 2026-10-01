import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { AuthService, AuthTokens } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterStoreDto } from "./dto/register-store.dto";
import { MerchantJwtAuthGuard } from "./guards/merchant-jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { StoresService } from "../stores/stores.service";

function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    storeId: user.storeId,
  };
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly storesService: StoresService,
    private readonly config: ConfigService,
  ) {}

  private setAuthCookies(res: Response, tokens: AuthTokens) {
    const secure = this.isCookieSecure();
    res.cookie("merchant_access_token", tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });
    res.cookie("merchant_refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh",
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

  @Post("register-store")
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async registerStore(@Body() dto: RegisterStoreDto, @Res({ passthrough: true }) res: Response) {
    const { user, store, tokens } = await this.authService.registerStore(dto);
    this.setAuthCookies(res, tokens);
    return { user: toPublicUser(user), store: { id: store.id, name: store.name, slug: store.slug } };
  }

  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateCredentials(dto.email, dto.password);
    const { tokens } = this.authService.login(user);
    this.setAuthCookies(res, tokens);
    return { user: toPublicUser(user) };
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.merchant_refresh_token;
    if (!refreshToken) {
      return { error: "No refresh token" };
    }
    const tokens = await this.authService.refresh(refreshToken);
    this.setAuthCookies(res, tokens);
    return { ok: true };
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("merchant_access_token", { path: "/" });
    res.clearCookie("merchant_refresh_token", { path: "/auth/refresh" });
    return { ok: true };
  }

  @Get("me")
  @UseGuards(MerchantJwtAuthGuard)
  async me(@CurrentUser() currentUser: AuthenticatedUser) {
    const user = await this.usersService.findById(currentUser.userId);
    if (!user) {
      return { user: null };
    }
    const store = user.storeId ? await this.storesService.findById(user.storeId) : null;
    return { user: { ...toPublicUser(user), storeSlug: store?.slug ?? null } };
  }
}
