import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@vertex/shared-types";
import { MerchantJwtAuthGuard } from "../auth/guards/merchant-jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CouponsService } from "./coupons.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { UpdateCouponStatusDto } from "./dto/update-coupon-status.dto";

@Controller("coupons")
@UseGuards(MerchantJwtAuthGuard, RolesGuard)
@Roles(UserRole.STORE_OWNER, UserRole.STORE_STAFF)
export class AdminCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.couponsService.findAllForStoreAdmin(user.storeId!);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCouponDto) {
    return this.couponsService.create(user.storeId!, dto);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) {
    return this.couponsService.findByIdForStoreAdmin(user.storeId!, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.update(user.storeId!, id, dto);
  }

  @Patch(":id/status")
  setStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCouponStatusDto,
  ) {
    return this.couponsService.setStatus(user.storeId!, id, dto.isActive);
  }

  @Get(":id/redemptions")
  redemptions(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) {
    return this.couponsService.findRedemptions(user.storeId!, id);
  }
}
