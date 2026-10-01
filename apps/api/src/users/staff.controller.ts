import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@vertex/shared-types";
import { MerchantJwtAuthGuard } from "../auth/guards/merchant-jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { StaffService } from "./staff.service";
import { CreateStaffDto } from "./dto/create-staff.dto";

@Controller("store/staff")
@UseGuards(MerchantJwtAuthGuard, RolesGuard)
@Roles(UserRole.STORE_OWNER)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.staffService.findAllForStore(user.storeId!);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateStaffDto) {
    return this.staffService.create(user.storeId!, dto);
  }

  @Patch(":id/deactivate")
  deactivate(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) {
    return this.staffService.setActive(user.storeId!, user.userId, id, false);
  }

  @Patch(":id/reactivate")
  reactivate(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) {
    return this.staffService.setActive(user.storeId!, user.userId, id, true);
  }
}
