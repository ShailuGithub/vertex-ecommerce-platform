import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@vertex/shared-types";
import { MerchantJwtAuthGuard } from "../auth/guards/merchant-jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
@UseGuards(MerchantJwtAuthGuard, RolesGuard)
@Roles(UserRole.STORE_OWNER, UserRole.STORE_STAFF)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  getSummary(@CurrentUser() user: AuthenticatedUser, @Query("days") days?: string) {
    const parsedDays = days ? Math.min(Math.max(Number(days) || 30, 1), 365) : 30;
    return this.analyticsService.getSummary(user.storeId!, parsedDays);
  }
}
